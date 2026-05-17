const User = require('../models/User');
const VaultItem = require('../models/VaultItem');
const SecurityLog = require('../models/SecurityLog');

/**
 * Admin Controller
 * 
 * Handles admin-only operations including:
 * - User management
 * - Dashboard statistics
 * - Activity log viewing
 * 
 * Security Features:
 * - All routes are protected with admin role check
 * - Sensitive data is never exposed
 * - All admin actions are logged
 * - RBAC ensures only admins can access these functions
 */

/**
 * Get dashboard statistics
 * 
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total vault items
    const totalVaultItems = await VaultItem.countDocuments();

    // Get locked accounts
    const lockedAccounts = await User.countDocuments({ isLocked: true });

    // Get failed login attempts in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const failedLogins = await SecurityLog.countDocuments({
      action: 'LOGIN_FAILED',
      createdAt: { $gte: yesterday }
    });

    // Get successful logins in last 24 hours
    const successfulLogins = await SecurityLog.countDocuments({
      action: 'LOGIN_SUCCESS',
      createdAt: { $gte: yesterday }
    });

    // Get new registrations in last 24 hours
    const newRegistrations = await SecurityLog.countDocuments({
      action: 'REGISTER',
      createdAt: { $gte: yesterday }
    });

    // Log admin action
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'ADMIN_STATS_VIEWED',
      description: 'Admin viewed dashboard statistics',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVaultItems,
        lockedAccounts,
        failedLogins,
        successfulLogins,
        newRegistrations
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
};

/**
 * Get all users
 * 
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // Never include password in user list
      .sort({ createdAt: -1 });

    // Log admin action
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'ADMIN_USER_VIEWED',
      description: 'Admin viewed all users',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
};

/**
 * Get user by ID
 * 
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's vault items count
    const vaultItemCount = await VaultItem.countDocuments({ user: user._id });

    // Log admin action
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'ADMIN_USER_VIEWED',
      description: `Admin viewed user: ${user.username}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { viewedUserId: user._id }
    });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        vaultItemCount
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user'
    });
  }
};

/**
 * Update user role
 * 
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    // Log admin action
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'ADMIN_USER_VIEWED',
      description: `Admin updated user role: ${user.username} to ${role}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { updatedUserId: user._id, newRole: role }
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

/**
 * Unlock user account
 * 
 * PUT /api/admin/users/:id/unlock
 */
const unlockUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Account is not locked'
      });
    }

    // Reset login attempts and unlock
    await user.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1, isLocked: 1 }
    });

    // Log admin action
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'ACCOUNT_UNLOCKED',
      description: `Admin unlocked account: ${user.username}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { unlockedUserId: user._id }
    });

    res.status(200).json({
      success: true,
      message: 'Account unlocked successfully'
    });

  } catch (error) {
    console.error('Unlock user account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock account'
    });
  }
};

/**
 * Get activity logs
 * 
 * GET /api/admin/logs
 */
const getActivityLogs = async (req, res) => {
  try {
    const { limit = 50, skip = 0, action, user } = req.query;

    // Build query
    const query = {};
    if (action) query.action = action;
    if (user) query.user = user;

    // Get logs with pagination
    const logs = await SecurityLog.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get total count
    const total = await SecurityLog.countDocuments(query);

    // Log admin action
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'ADMIN_LOGS_VIEWED',
      description: 'Admin viewed activity logs',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      logs
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity logs'
    });
  }
};

/**
 * Delete user
 * 
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's vault items
    await VaultItem.deleteMany({ user: user._id });

    // Delete user
    await user.deleteOne();

    // Log admin action
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'ADMIN_USER_VIEWED',
      description: `Admin deleted user: ${user.username}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { deletedUserId: user._id }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  unlockUserAccount,
  getActivityLogs,
  deleteUser
};
