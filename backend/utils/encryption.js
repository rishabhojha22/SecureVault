const crypto = require('crypto');

/**
 * Encryption Utility
 * 
 * This module handles AES-256 encryption and decryption for sensitive data.
 * 
 * Security Concepts:
 * - AES-256 is a symmetric encryption algorithm (same key for encrypt/decrypt)
 * - It's widely used and considered secure for most applications
 * - The encryption key must be kept secret and stored in environment variables
 * - Never hardcode encryption keys in your code
 * 
 * Why AES-256:
 * - 256-bit key size provides strong security
 * - Symmetric encryption is fast and efficient
 * - Industry standard for encrypting sensitive data
 * 
 * Encryption vs Hashing:
 * - Encryption: Two-way transformation (can decrypt with key)
 * - Hashing: One-way transformation (cannot reverse)
 * - We use encryption for vault items because we need to retrieve original data
 * - We use hashing for passwords because we never need to retrieve them
 */

// Get encryption key from environment variables
// The key must be exactly 32 characters for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_32_character_encryption_key';

// Ensure the key is exactly 32 bytes (256 bits)
// If it's shorter, pad it; if longer, truncate it
const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32); // Derive a 32-byte key
const IV_LENGTH = 16; // AES block size is 16 bytes

/**
 * Encrypt data using AES-256-CBC
 * 
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encrypted
 * 
 * Process:
 * 1. Generate a random initialization vector (IV)
 * 2. Encrypt the text using AES-256-CBC
 * 3. Return IV + encrypted data (IV is needed for decryption)
 * 
 * Why random IV:
 * - Same plaintext encrypted with same key produces different ciphertext
 * - Prevents pattern analysis attacks
 * - IV doesn't need to be secret, but must be unique for each encryption
 */
const encrypt = (text) => {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher with AES-256-CBC algorithm
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data (IV is needed for decryption)
    // Format: iv:encrypted
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-256-CBC
 * 
 * @param {string} encryptedText - Encrypted text in format: iv:encrypted
 * @returns {string} - Decrypted plain text
 * 
 * Process:
 * 1. Extract IV from the encrypted text
 * 2. Extract the actual encrypted data
 * 3. Decrypt using the same key and IV
 */
const decrypt = (encryptedText) => {
  try {
    // Split the encrypted text to get IV and encrypted data
    const textParts = encryptedText.split(':');
    
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    // Extract IV and encrypted data
    const iv = Buffer.from(textParts[0], 'hex');
    const encrypted = textParts[1];
    
    // Create decipher with AES-256-CBC algorithm
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypt an object's sensitive fields
 * 
 * @param {object} obj - Object to encrypt
 * @param {array} fields - Array of field names to encrypt
 * @returns {object} - Object with encrypted fields
 */
const encryptObject = (obj, fields) => {
  const encryptedObj = { ...obj };
  
  fields.forEach(field => {
    if (encryptedObj[field]) {
      encryptedObj[field] = encrypt(encryptedObj[field]);
    }
  });
  
  return encryptedObj;
};

/**
 * Decrypt an object's sensitive fields
 * 
 * @param {object} obj - Object to decrypt
 * @param {array} fields - Array of field names to decrypt
 * @returns {object} - Object with decrypted fields
 */
const decryptObject = (obj, fields) => {
  const decryptedObj = { ...obj };
  
  fields.forEach(field => {
    if (decryptedObj[field]) {
      try {
        decryptedObj[field] = decrypt(decryptedObj[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Keep the encrypted value if decryption fails
      }
    }
  });
  
  return decryptedObj;
};

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject
};
