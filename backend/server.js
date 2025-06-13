const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./database');
const {
  registerUser,
  loginUser,
  authenticateToken,
  getCurrentUser,
  logoutUser,
} = require('./auth');
const {
  validateUsername,
  validateEmail,
  validatePassword,
  validateLoginIdentifier,
  handleValidationErrors,
  sanitizeInput,
} = require('./validators');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Allow external connections

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS configuration - Allow multiple origins for development and production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'http://localhost:5174', // Alternative Vite port
  'http://localhost:3000', // Docker frontend
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://0.0.0.0:5173',
  'http://0.0.0.0:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Handle preflight requests
app.options('*', cors());

// Request logging
app.use(
  morgan('combined', {
    // Don't log passwords or sensitive data
    skip: (req, res) => {
      return req.url.includes('/auth/') && req.method === 'POST';
    },
  })
);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    host: HOST,
  });
});

// Authentication routes
app.post(
  '/auth/register',
  authLimiter,
  validateUsername(),
  validateEmail(),
  validatePassword(),
  handleValidationErrors,
  registerUser
);

// Import body from express-validator for the login route
const { body } = require('express-validator');

app.post(
  '/auth/login',
  authLimiter,
  validateLoginIdentifier(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
  loginUser
);

app.post('/auth/logout', authenticateToken, logoutUser);

// Protected routes
app.get('/auth/me', authenticateToken, getCurrentUser);

// Dashboard route (protected)
app.get('/dashboard', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to your dashboard!',
    data: {
      user: {
        id: req.user.userId,
        username: req.user.username,
        displayName: req.user.displayName,
        email: req.user.email,
      },
      dashboardData: {
        lastLogin: new Date().toISOString(),
        message: 'You have successfully accessed the protected dashboard.',
      },
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🔐 Auth endpoints:`);
      console.log(`   - POST http://${HOST}:${PORT}/auth/register`);
      console.log(`   - POST http://${HOST}:${PORT}/auth/login`);
      console.log(`   - POST http://${HOST}:${PORT}/auth/logout`);
      console.log(`   - GET http://${HOST}:${PORT}/auth/me`);
      console.log(
        `🏠 Dashboard: GET http://${HOST}:${PORT}/dashboard (protected)`
      );
      console.log(`🌍 CORS enabled for origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

module.exports = app;
