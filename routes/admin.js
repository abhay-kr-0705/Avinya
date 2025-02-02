const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');
const { sendNotification } = require('../controllers/notificationController');

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  });

// Log middleware for debugging
router.use((req, res, next) => {
  console.log('Admin route accessed:', {
    path: req.path,
    method: req.method,
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
  next();
});

// Protect all admin routes
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: err.message
    });
  }
}));

// Update user role
router.put('/users/:id/role', protect, authorize('superadmin'), asyncHandler(async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: err.message
    });
  }
}));

// Get dashboard statistics
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      last_login: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalEvents,
        upcomingEvents
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: err.message
    });
  }
}));

// Get all events with registration details
router.get('/events', asyncHandler(async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: 'registrations.user',
        select: 'name email registration_no branch semester mobile role'
      })
      .sort({ date: -1 });

    // Transform the data to include registration count
    const transformedEvents = events.map(event => ({
      ...event.toObject(),
      registrationCount: event.registrations ? event.registrations.length : 0
    }));

    res.json({
      success: true,
      count: events.length,
      data: transformedEvents
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: err.message
    });
  }
}));

// Get event registrations
router.get('/events/:id/registrations', asyncHandler(async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'registrations.user',
        select: 'name email registration_no branch semester mobile role'
      });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      count: event.registrations.length,
      data: event.registrations
    });
  } catch (err) {
    console.error('Error fetching event registrations:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching event registrations',
      error: err.message
    });
  }
}));

// Create new event
router.post('/events', asyncHandler(async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: err.message
    });
  }
}));

// Update event
router.put('/events/:id', asyncHandler(async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: err.message
    });
  }
}));

// Delete event
router.delete('/events/:id', asyncHandler(async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: err.message
    });
  }
}));

// Send notification
router.post('/notifications/send', asyncHandler(async (req, res) => {
  try {
    const { title, message, type, userIds } = req.body;
    console.log('Received notification request:', { title, message, type, userIds });
    
    // Get target user tokens
    let tokens = [];
    let users = [];
    
    if (type === 'all') {
      users = await User.find({ fcmToken: { $exists: true } });
      console.log('Found users with FCM tokens:', users.length);
      console.log('User details:', users.map(u => ({ id: u._id, email: u.email, fcmToken: u.fcmToken })));
      tokens = users.map(user => user.fcmToken).filter(Boolean);
    } else if (type === 'targeted' && userIds?.length > 0) {
      users = await User.find({ 
        _id: { $in: userIds },
        fcmToken: { $exists: true }
      });
      console.log('Found targeted users with FCM tokens:', users.length);
      console.log('Targeted user details:', users.map(u => ({ id: u._id, email: u.email, fcmToken: u.fcmToken })));
      tokens = users.map(user => user.fcmToken).filter(Boolean);
    }

    console.log('Valid FCM tokens:', tokens.length);

    if (tokens.length === 0) {
      console.log('No valid FCM tokens found');
      return res.status(400).json({
        success: false,
        message: 'No valid FCM tokens found for the target users'
      });
    }

    // Send notification
    console.log('Sending notification to tokens:', tokens);
    const result = await sendNotification(title, message, tokens);
    console.log('Notification send result:', result);

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
}));

module.exports = router;
