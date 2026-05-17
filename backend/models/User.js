const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * 
 * This model represents a user in the SecureVault system.
 * 
 * Security Features:
 * - Password hashing using bcrypt
 * - Automatic salting (bcrypt handles this)
 * - Role-based access control (RBAC)
 * - Account lockout mechanism
 * - Failed login attempt tracking
 * 
 * Hashing vs Encryption:
 * - Hashing is one-way: password -> hash (cannot reverse)
 * - Encryption is two-way: data -> encrypted data -> data (can reverse with key)
 * - We use hashing for passwords because we never need to retrieve the original password
 * - We use encryption for vault items because we need to retrieve the original data
 */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    // Email validation using regex
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    // Password is hashed before saving (see pre-save hook)
    select: false // Never return password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Account lockout fields
  isLocked: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

/**
 * Pre-save hook to hash password before saving to database
 * 
 * This is a critical security feature:
 * - Passwords are NEVER stored in plain text
 * - bcrypt automatically handles salting (adding random data to each hash)
 * - Same password will have different hashes each time (due to salt)
 * - This prevents rainbow table attacks
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    // Salt rounds: 10 is a good balance between security and performance
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare entered password with hashed password in database
 * 
 * This is used during login to verify credentials
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to increment failed login attempts
 * Used for account lockout after multiple failed attempts
 */
userSchema.methods.incLoginAttempts = function() {
  // If account is locked and lock time has expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1, isLocked: 1 }
    });
  }

  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= parseInt(process.env.MAX_LOGIN_ATTEMPTS) && !this.isLocked) {
    updates.$set = {
      isLocked: true,
      lockUntil: Date.now() + parseInt(process.env.LOCK_TIME_MS)
    };
  }

  return this.updateOne(updates);
};

/**
 * Method to reset login attempts after successful login
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1, isLocked: 1 },
    $set: { lastLogin: Date.now() }
  });
};

/**
 * Virtual property to check if account is currently locked
 */
userSchema.virtual('isCurrentlyLocked').get(function() {
  return !!(this.isLocked && this.lockUntil && this.lockUntil > Date.now());
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
