const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  unlockUserAccount,
  getActivityLogs,
  deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

/**
 * Admin Routes
 * 
 * These routes handle admin-only operations.
 * 
 * Security Features:
 * - All routes are protected with JWT authentication
 * - All routes require admin role (RBAC)
 * - Sensitive data is never exposed
 * - All admin actions are logged for audit trail
 * - Prevents admins from modifying their own role or deleting themselves
 */

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 * @security: JWT protected, admin role required
 */
router.get('/stats', protect, authorize('admin'), getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 * @security: JWT protected, admin role required
 */
router.get('/users', protect, authorize('admin'), getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 * @security: JWT protected, admin role required
 */
router.get('/users/:id', protect, authorize('admin'), getUserById);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 * @security: JWT protected, admin role required
 */
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

/**
 * @route   PUT /api/admin/users/:id/unlock
 * @desc    Unlock user account
 * @access  Private (Admin only)
 * @security: JWT protected, admin role required
 */
router.put('/users/:id/unlock', protect, authorize('admin'), unlockUserAccount);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 * @security: JWT protected, admin role required
 */
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

/**
 * @route   GET /api/admin/logs
 * @desc    Get activity logs
 * @access  Private (Admin only)
 * @security: JWT protected, admin role required
 */
router.get('/logs', protect, authorize('admin'), getActivityLogs);

module.exports = router;
