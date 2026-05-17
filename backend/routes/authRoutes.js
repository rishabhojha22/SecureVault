const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../middleware/validationMiddleware');
const { authLimiter, registrationLimiter } = require('../middleware/rateLimiter');
const { logAuthEvent } = require('../middleware/activityLogger');

/**
 * Authentication Routes
 * 
 * These routes handle user authentication operations.
 * 
 * Security Features:
 * - Rate limiting on login and registration endpoints
 * - Input validation to prevent injection attacks
 * - Activity logging for security monitoring
 * - JWT token generation for authenticated requests
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @security: Rate limited, input validated, activity logged
 */
router.post('/register', registrationLimiter, validateRegistration, logAuthEvent('REGISTER', 'User registration attempt'), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @security: Rate limited, input validated, activity logged
 */
router.post('/login', authLimiter, validateLogin, logAuthEvent('LOGIN_SUCCESS', 'User login attempt'), login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 * @security: JWT protected
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 * @security: JWT protected, activity logged
 */
router.post('/logout', protect, logout);

module.exports = router;
