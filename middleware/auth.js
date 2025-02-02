const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add role check for admin routes
      const isAdmin = user.role === 'admin' || user.role === 'superadmin';
      if (req.baseUrl.includes('/admin') && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to access admin routes' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Server error in auth:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('Authorization failed:', {
        userRole: req.user.role,
        requiredRoles: roles,
        userId: req.user._id,
        email: req.user.email
      });
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
