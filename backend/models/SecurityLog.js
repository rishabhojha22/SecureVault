const mongoose = require('mongoose');

/**
 * SecurityLog Model
 * 
 * This model tracks all security-related events in the system.
 * 
 * Security Features:
 * - Comprehensive logging of security events
 * - Tracks authentication attempts (success/failure)
 * - Tracks vault operations (add/edit/delete)
 * - Tracks admin actions
 * - Helps detect suspicious activity
 * - Essential for security auditing and forensics
 * 
 * Why Security Logging is Important:
 * - Detects brute-force attacks
 * - Identifies unauthorized access attempts
 * - Provides audit trail for compliance
 * - Helps in incident response
 * - Monitors user behavior patterns
 */

const securityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      // Authentication actions
      'REGISTER',
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      // Vault actions
      'VAULT_ITEM_CREATED',
      'VAULT_ITEM_UPDATED',
      'VAULT_ITEM_DELETED',
      'VAULT_ITEM_VIEWED',
      // Admin actions
      'ADMIN_USER_VIEWED',
      'ADMIN_LOGS_VIEWED',
      'ADMIN_STATS_VIEWED',
      // Other security events
      'PASSWORD_CHANGE',
      'UNAUTHORIZED_ACCESS_ATTEMPT'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  // IP address of the request
  ipAddress: {
    type: String,
    default: null
  },
  // User agent (browser/device info)
  userAgent: {
    type: String,
    default: null
  },
  // Whether the action was successful
  success: {
    type: Boolean,
    default: true
  },
  // Additional metadata (flexible for different event types)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Index for faster time-based queries
  }
});

// Index for efficient queries
securityLogSchema.index({ user: 1, createdAt: -1 });
securityLogSchema.index({ action: 1, createdAt: -1 });

/**
 * Static method to create a security log entry
 * This provides a consistent way to log security events
 */
securityLogSchema.statics.logEvent = async function(logData) {
  try {
    await this.create(logData);
  } catch (error) {
    console.error('Error creating security log:', error);
    // Don't throw error - logging failures shouldn't break the app
  }
};

module.exports = mongoose.model('SecurityLog', securityLogSchema);
