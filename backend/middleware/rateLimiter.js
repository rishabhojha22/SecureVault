const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * 
 * Rate limiting protects against brute-force attacks and DDoS attacks.
 * 
 * Why Rate Limiting:
 * - Prevents brute-force attacks on login endpoints
 * - Protects against DDoS attacks
 * - Prevents API abuse
 * - Ensures fair resource allocation
 * 
 * How it Works:
 * - Tracks requests per IP address
 * - Limits number of requests in a time window
 * - Returns 429 (Too Many Requests) when limit exceeded
 */

/**
 * General rate limiter for all API endpoints
 * - 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * - 5 requests per 15 minutes per IP
 * - More restrictive to prevent brute-force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Very strict rate limiter for registration
 * - 3 requests per hour per IP
 * - Prevents automated account creation
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many registration attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  registrationLimiter
};
