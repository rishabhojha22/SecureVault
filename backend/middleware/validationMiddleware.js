const { body, validationResult } = require('express-validator');
const validator = require('validator');

/**
 * Input Validation Middleware
 * 
 * Input validation prevents injection attacks and ensures data integrity.
 * 
 * Why Input Validation:
 * - Prevents SQL injection (though we use MongoDB)
 * - Prevents NoSQL injection
 * - Prevents XSS attacks
 * - Ensures data quality
 * - Provides user-friendly error messages
 * 
 * Types of Validation:
 * - Format validation (email, URL, etc.)
 * - Length validation (min/max characters)
 * - Type validation (string, number, etc.)
 * - Content validation (allowed characters, patterns)
 */

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Sanitize user input to prevent NoSQL injection
 * Removes MongoDB operators from user input
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    // Check for MongoDB operators
    const mongoOperators = ['$where', '$ne', '$in', '$or', '$and', '$exists', '$regex'];
    
    for (const key in obj) {
      if (mongoOperators.includes(key)) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    
    return obj;
  };

  // Sanitize body, query, and params
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

/**
 * Validation rules for registration
 */
const validateRegistration = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for vault item
 */
const validateVaultItem = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ max: 100 }).withMessage('Username cannot exceed 100 characters'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      // Allow localhost URLs and standard URLs
      const localhostRegex = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i;
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return localhostRegex.test(value) || urlRegex.test(value) || validator.isURL(value);
    }).withMessage('Please provide a valid URL')
    .isLength({ max: 255 }).withMessage('Website URL cannot exceed 255 characters'),
  
  body('category')
    .optional()
    .isIn(['website', 'api', 'note', 'other']).withMessage('Invalid category'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateRegistration,
  validateLogin,
  validateVaultItem
};
