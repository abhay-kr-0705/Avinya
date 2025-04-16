const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized to access this route',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check token expiration with a buffer
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp - now < 60) { // Less than 60 seconds left
        return res.status(401).json({ 
          message: 'Token is about to expire, please refresh',
          code: 'TOKEN_EXPIRING' 
        });
      }
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found', 
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Set user on request object
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token', 
          code: 'INVALID_TOKEN'
        });
      } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired', 
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        message: 'Authentication error', 
        code: 'AUTH_ERROR',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Optional middleware that only checks for authentication but doesn't require it
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, just continue without setting req.user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        // Set user on request object if found
        req.user = user;
      }
    } catch (err) {
      // Just continue without setting req.user if token is invalid
      console.log('Optional auth error:', err.message);
    }
    
    // Always continue to the next middleware
    next();
  } catch (err) {
    // Don't block the request on error
    console.error('Optional auth middleware error:', err);
    next();
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
