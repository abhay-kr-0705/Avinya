const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet'); // Import Helmet for security headers

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const resourceRoutes = require('./routes/resources');
const galleryRoutes = require('./routes/gallery');
const adminRoutes = require('./routes/admin');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://genx-developers-club.netlify.app', 'https://avinya-tech-fest-sec-sasaram.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// CORS middleware to ensure headers are set for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || corsOptions.origin[0]);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// Security Middleware
app.use(helmet()); // Adds security headers

// Additional headers to prevent clickjacking
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY"); // Blocks all iframe embedding
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'"); // No iframe embedding allowed
  next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before routes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  // Set CORS headers on 404 responses too
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(404).json({ 
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Set CORS headers on error responses too
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// MongoDB connection
async function connectDB() {
  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@'));
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected Successfully');
    
    // Test the connection by trying to fetch events
    const Event = require('./models/Event');
    const events = await Event.find();
    console.log(`Successfully fetched ${events.length} events from database`);
    events.forEach(event => {
      console.log(`Event: ${event.title}, Date: ${event.date}, Type: ${event.type}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log('CORS enabled for:', corsOptions.origin);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
