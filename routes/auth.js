const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, registration_no, branch, semester, mobile } = req.body;

    // Validate required fields
    const requiredFields = ['email', 'password', 'name', 'registration_no', 'branch', 'semester', 'mobile'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    existingUser = await User.findOne({ registration_no });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this registration number already exists'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      registration_no,
      branch,
      semester,
      mobile: mobile.trim()
    });

    // Check if user should be admin
    if (email === 'abhayk7481@gmail.com' || email === 'genx.gdc@gmail.com') {
      user.isAdmin = true;
      user.role = 'admin';
    }

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registration_no: user.registration_no,
        branch: user.branch,
        semester: user.semester,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field.replace('_', ' ')} already exists`
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Fetch all users
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Update admin status if needed
    if (email === 'abhayk7481@gmail.com' || email === 'genx.gdc@gmail.com') {
      user.isAdmin = true;
      user.role = 'admin';
      await user.save();
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registration_no: user.registration_no,
        branch: user.branch,
        semester: user.semester,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Update admin status if needed
    if (user.email === 'abhayk7481@gmail.com' || user.email === 'genx.gdc@gmail.com') {
      user.isAdmin = true;
      user.role = 'admin';
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Error getting user data' });
  }
});

// Logout user - no authentication required since we're just clearing client-side data
router.post('/logout', (req, res) => {
  try {
    // We don't need to do anything server-side since we're using JWT
    // Just send a success response
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Error logging out' });
  }
});

// Update user profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateFields = ['name', 'email', 'registration_no', 'branch', 'semester', 'mobile'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        registration_no: user.registration_no,
        branch: user.branch,
        semester: user.semester,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

module.exports = router;
