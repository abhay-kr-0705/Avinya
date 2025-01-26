const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

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

// Get all events with registration counts
router.get('/events', asyncHandler(async (req, res) => {
  try {
    const events = await Event.find().lean();
    res.json(events || []);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Server Error' });
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
    const { name, description, start_date, end_date, venue } = req.body;
    
    const event = new Event({
      name,
      description,
      start_date,
      end_date,
      venue
    });

    const savedEvent = await event.save();
    res.json(savedEvent.toObject());
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}));

// Update event
router.put('/events/:id', asyncHandler(async (req, res) => {
  try {
    const { name, description, start_date, end_date, venue } = req.body;
    
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.name = name;
    event.description = description;
    event.start_date = start_date;
    event.end_date = end_date;
    event.venue = venue;

    const updatedEvent = await event.save();
    res.json(updatedEvent.toObject());
  } catch (err) {
    console.error('Error updating event:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
}));

// Delete event
router.delete('/events/:id', asyncHandler(async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error('Error deleting event:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
}));

module.exports = router;
