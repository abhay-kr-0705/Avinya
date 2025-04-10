import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet'; // Import Helmet for security headers
import crypto from 'crypto';

// Import routes
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import resourceRoutes from './routes/resources.js';
import galleryRoutes from './routes/gallery.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://genspark-techfest-sec-sasaram.netlify.app',
      'https://avinya-backend.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'X-Razorpay-Signature'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log('Request origin:', req.headers.origin);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  next();
});

// Handle preflight requests
app.options('*', cors(corsOptions));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Additional headers to prevent clickjacking
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
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
app.use('/api/payments', paymentRoutes);

// Error handling for payment routes
app.use('/api/payments', (err, req, res, next) => {
  console.error('Payment Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Payment processing error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

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
    const Event = (await import('./models/Event.js')).default;
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

export default app;
