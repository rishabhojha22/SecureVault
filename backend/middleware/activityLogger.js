const SecurityLog = require('../models/SecurityLog');

/**
 * Activity Logging Middleware
 * 
 * This middleware logs security-related events for auditing and monitoring.
 * 
 * Why Activity Logging:
 * - Detects suspicious activity patterns
 * - Provides audit trail for compliance
 * - Helps in incident response
 * - Monitors user behavior
 * - Essential for security forensics
 * 
 * What to Log:
 * - Authentication attempts (success/failure)
 * - Authorization failures
 * - Data access/modification
 * - Admin actions
 * - Failed operations
 */

/**
 * Middleware to log security events
 * 
 * @param {string} action - The action being performed
 * @param {string} description - Description of the action
 */
const logActivity = (action, description) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override res.json to log after response is sent
    res.json = function(data) {
      // Log the activity
      SecurityLog.logEvent({
        user: req.user ? req.user._id : null,
        action: action,
        description: description,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        success: data.success !== false,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode
        }
      });

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Log authentication events
 */
const logAuthEvent = (action, description) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
      SecurityLog.logEvent({
        user: req.user ? req.user._id : null,
        action: action,
        description: description,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        success: data.success !== false,
        metadata: {
          email: req.body.email || 'unknown'
        }
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Log vault operations
 */
const logVaultEvent = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
      SecurityLog.logEvent({
        user: req.user ? req.user._id : null,
        action: action,
        description: `${action} for vault item`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        success: data.success !== false,
        metadata: {
          itemId: req.params.id || 'new',
          title: req.body.title || 'unknown'
        }
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  logActivity,
  logAuthEvent,
  logVaultEvent
};
