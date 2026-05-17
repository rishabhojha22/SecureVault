/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * This middleware implements role-based authorization.
 * 
 * RBAC Concepts:
 * - Roles: Define what a user is (admin, user)
 * - Permissions: Define what a user can do
 * - Principle of Least Privilege: Users only have access they need
 * 
 * Why RBAC:
 * - Security: Prevents unauthorized access
 * - Scalability: Easy to manage permissions as system grows
 * - Compliance: Helps meet security standards
 * - Audit: Clear permission structure for auditing
 */

/**
 * Authorize specific roles
 * 
 * @param  {...string} roles - Roles that are allowed to access the route
 * @returns {function} - Middleware function
 * 
 * Usage:
 * router.get('/admin', protect, authorize('admin'), adminController.getStats);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be attached by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login.'
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Check if user owns the resource
 * Used for routes where users can only access their own data
 * 
 * @param {string} resourceUserId - ID of the user who owns the resource
 * @returns {boolean} - True if user owns resource or is admin
 */
const isOwnerOrAdmin = (req, resourceUserId) => {
  // Admin can access any resource
  if (req.user.role === 'admin') {
    return true;
  }

  // User can only access their own resources
  return req.user._id.toString() === resourceUserId.toString();
};

/**
 * Middleware to check resource ownership
 * 
 * Usage:
 * router.get('/vault/:id', protect, checkOwnership, vaultController.getItem);
 * 
 * The route handler should set req.resourceUserId before this middleware
 */
const checkOwnership = (req, res, next) => {
  if (!req.resourceUserId) {
    return res.status(500).json({
      success: false,
      message: 'Resource ownership not set'
    });
  }

  if (!isOwnerOrAdmin(req, req.resourceUserId)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource'
    });
  }

  next();
};

module.exports = {
  authorize,
  isOwnerOrAdmin,
  checkOwnership
};
