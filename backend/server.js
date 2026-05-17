const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/validationMiddleware');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const adminRoutes = require('./routes/adminRoutes');

/**
 * Express Server Configuration
 * 
 * This is the main entry point for the backend server.
 * 
 * Security Features Implemented:
 * - Helmet: Sets security-related HTTP headers
 * - CORS: Controls cross-origin requests
 * - Rate Limiting: Prevents brute-force attacks
 * - Input Sanitization: Prevents NoSQL injection
 * - Error Handling: Centralized error handling
 * - Environment Variables: Secure configuration management
 */

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

/**
 * Security Middleware
 */

// Helmet: Sets various HTTP headers for security
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: deny
// - X-XSS-Protection: 1; mode=block
// - And many more...
app.use(helmet());

// CORS: Enable Cross-Origin Resource Sharing
// In production, specify the exact frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parser: Parse JSON request bodies
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS

// URL parser: Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting: Apply general rate limiting to all routes
app.use('/api', generalLimiter);

// Input sanitization: Sanitize all incoming requests
app.use(sanitizeInput);

/**
 * API Routes
 */

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SecureVault API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Error Handling
 */

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║           SecureVault API Server Started                 ║
║                                                          ║
║  Environment: ${process.env.NODE_ENV || 'development'}                      ║
║  Port: ${PORT}                                             ║
║  URL: http://localhost:${PORT}                            ║
║                                                          ║
║  Security Features Enabled:                              ║
║  ✓ Helmet Security Headers                               ║
║  ✓ CORS Protection                                      ║
║  ✓ Rate Limiting                                         ║
║  ✓ Input Sanitization                                    ║
║  ✓ JWT Authentication                                    ║
║  ✓ AES-256 Encryption                                    ║
║  ✓ Password Hashing (bcrypt)                             ║
║  ✓ Activity Logging                                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
