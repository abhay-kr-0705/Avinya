const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const resourceRoutes = require('./routes/resources');
const galleryRoutes = require('./routes/gallery');
const adminRoutes = require('./routes/admin');
const fcmRoutes = require('./routes/fcmRoutes');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://genx-developers-club.netlify.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
    
    console.log('Allowed by CORS:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fcm', fcmRoutes);

// Debug route to list all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  // Helper function to extract routes from a router
  const extractRoutes = (stack, prefix = '') => {
    stack.forEach((middleware) => {
      if (middleware.route) {
        routes.push({
          path: prefix + middleware.route.path,
          methods: Object.keys(middleware.route.methods),
          stack: middleware.route.stack.length
        });
      } else if (middleware.name === 'router') {
        // Recursively extract routes from nested routers
        const routerPath = middleware.regexp.source.replace('^\\/','').replace('\\/?(?=\\/|$)','');
        extractRoutes(middleware.handle.stack, '/' + routerPath);
      }
    });
  };

  // Extract routes from main app
  extractRoutes(app._router.stack);

  res.json({
    routes,
    routeCount: routes.length,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body
  });
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: '/api/debug/routes'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method
  });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
      }
    });
  });
});

module.exports = app;
