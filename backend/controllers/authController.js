const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');

/**
 * Authentication Controller
 * 
 * Handles user registration, login, and logout.
 * 
 * Security Features:
 * - Password hashing with bcrypt (handled in User model)
 * - JWT token generation for authentication
 * - Account lockout after failed login attempts
 * - Activity logging for security monitoring
 */

/**
 * Generate JWT Token
 * 
 * @param {string} id - User ID
 * @returns {string} - JWT token
 * 
 * JWT Token Structure:
 * - Header: Algorithm and token type
 * - Payload: User data (user ID in this case)
 * - Signature: Hash of header, payload, and secret key
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Register a new user
 * 
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user
    // Password will be hashed automatically by the User model's pre-save hook
    const user = await User.create({
      username,
      email,
      password
    });

    // Log registration event
    await SecurityLog.logEvent({
      user: user._id,
      action: 'REGISTER',
      description: 'New user registered',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: { username, email }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login user
 * 
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Log failed login attempt
      await SecurityLog.logEvent({
        action: 'LOGIN_FAILED',
        description: 'Login failed: User not found',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
        metadata: { email }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isCurrentlyLocked) {
      await SecurityLog.logEvent({
        user: user._id,
        action: 'LOGIN_FAILED',
        description: 'Login failed: Account locked',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
        metadata: { email }
      });

      return res.status(403).json({
        success: false,
        message: 'Account is locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      // Log failed login attempt
      await SecurityLog.logEvent({
        user: user._id,
        action: 'LOGIN_FAILED',
        description: 'Login failed: Invalid password',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
        metadata: { 
          email,
          loginAttempts: user.loginAttempts + 1
        }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Log successful login
    await SecurityLog.logEvent({
      user: user._id,
      action: 'LOGIN_SUCCESS',
      description: 'User logged in successfully',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Get current user
 * 
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};

/**
 * Logout user
 * 
 * POST /api/auth/logout
 * 
 * Note: With JWT, logout is handled client-side by removing the token.
 * This endpoint logs the logout event for security monitoring.
 */
const logout = async (req, res) => {
  try {
    // Log logout event
    await SecurityLog.logEvent({
      user: req.user._id,
      action: 'LOGOUT',
      description: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
