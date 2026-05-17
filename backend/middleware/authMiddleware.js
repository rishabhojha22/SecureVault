const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * 
 * This middleware verifies JWT tokens and protects routes.
 * 
 * JWT (JSON Web Token) Authentication Flow:
 * 1. User logs in with credentials
 * 2. Server verifies credentials and generates a JWT token
 * 3. Token contains user ID and is signed with a secret key
 * 4. Client stores token (typically in localStorage or httpOnly cookie)
 * 5. Client sends token in Authorization header: "Bearer <token>"
 * 6. Server verifies token signature and extracts user ID
 * 7. Server fetches user from database and attaches to request object
 * 
 * Why JWT:
 * - Stateless: No session storage needed on server
 * - Scalable: Works well in distributed systems
 * - Secure: Token is signed, cannot be tampered with
 * - Standard: Widely adopted industry standard
 */

const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in Authorization header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer <token>" format
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // 2. Verify token signature using the secret key
      // This ensures the token hasn't been tampered with
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Extract user ID from decoded token
      // The token payload contains the user ID
      req.user = await User.findById(decoded.id);

      // If user doesn't exist (account deleted), deny access
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Please login again.'
        });
      }

      // 4. Check if account is locked
      if (req.user.isCurrentlyLocked) {
        return res.status(403).json({
          success: false,
          message: 'Account is locked due to multiple failed login attempts. Please try again later.'
        });
      }

      // 5. Proceed to next middleware/route handler
      next();

    } catch (error) {
      // Token verification failed
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route.'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
      } catch (error) {
        // Token invalid, but we don't block the request
        console.log('Optional auth: Invalid token');
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  optionalAuth
};
