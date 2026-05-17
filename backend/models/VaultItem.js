const mongoose = require('mongoose');

/**
 * VaultItem Model
 * 
 * This model represents a stored credential in the user's vault.
 * 
 * Security Features:
 * - All sensitive data is encrypted before storage
 * - Data is encrypted using AES-256 encryption
 * - Each item belongs to a specific user (user ownership)
 * - Users can only access their own vault items
 * 
 * Encryption vs Hashing:
 * - We use ENCRYPTION here (not hashing) because we need to retrieve the original data
 * - Hashing is one-way (passwords)
 * - Encryption is two-way (vault items - we need to show the password to the user)
 */

const vaultItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster queries
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [255, 'Website URL cannot exceed 255 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    maxlength: [100, 'Username cannot exceed 100 characters']
  },
  // Password is encrypted before storage
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  // Additional sensitive fields (also encrypted)
  apiKey: {
    type: String,
    trim: true,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: null
  },
  category: {
    type: String,
    enum: ['website', 'api', 'note', 'other'],
    default: 'website'
  },
  // Tags for organization
  tags: [{
    type: String,
    trim: true
  }],
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
vaultItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster searches by user
vaultItemSchema.index({ user: 1, title: 1 });

module.exports = mongoose.model('VaultItem', vaultItemSchema);
