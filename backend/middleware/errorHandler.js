/**
 * Global Error Handler Middleware
 * 
 * This middleware catches all errors and provides consistent error responses.
 * 
 * Why Centralized Error Handling:
 * - Consistent error responses across the application
 * - Prevents sensitive information leakage
 * - Easier debugging and logging
 * - Better user experience
 * 
 * Security Considerations:
 * - Never expose stack traces in production
 * - Never leak sensitive information in error messages
 * - Log errors server-side for debugging
 * - Return generic error messages to clients
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in production, use a proper logging service)
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Server Error',
    statusCode: err.statusCode || 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.statusCode = 400;
    error.errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
    error.field = Object.keys(err.keyPattern)[0];
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Return error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    // Include additional error details in development only
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      ...error
    })
  });
};

/**
 * 404 Not Found Handler
 * This should be placed after all routes
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFound
};
