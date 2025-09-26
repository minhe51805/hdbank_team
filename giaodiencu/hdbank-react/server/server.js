// HDBank Authentication Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HDBank Authentication Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint to verify database connection
app.get('/api/test', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      userCount: result.rows[0].user_count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HDBank Authentication API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/logout', 
      'GET /api/auth/profile',
      'GET /api/auth/verify',
      'GET /health',
      'GET /api/test'
    ],
    documentation: 'See USERS_CREDENTIALS.md for login details'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 HDBank Authentication Server started');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`💾 Database: PostgreSQL on port ${process.env.DB_PORT || 5435}`);
  console.log(`📊 User accounts: 500 customers ready`);
  console.log('✅ Server ready to handle authentication requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
