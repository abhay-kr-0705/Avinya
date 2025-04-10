const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
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

// Get event registrations with detailed information
router.get('/events/:id/registrations', asyncHandler(async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get all registrations for this event with detailed information
    const registrations = await EventRegistration.find({ event: req.params.id })
      .select('name email registration_no mobile_no semester teamName isLeader status paymentStatus created_at')
      .sort({ created_at: -1 });

    // Group registrations by team if it's a group event
    let formattedRegistrations = registrations;
    if (event.eventType === 'group') {
      const teamMap = new Map();
      
      registrations.forEach(reg => {
        if (reg.teamName) {
          if (!teamMap.has(reg.teamName)) {
            teamMap.set(reg.teamName, {
              teamName: reg.teamName,
              members: [],
              leader: null
            });
          }
          
          const team = teamMap.get(reg.teamName);
          if (reg.isLeader) {
            team.leader = reg;
          } else {
            team.members.push(reg);
          }
        }
      });
      
      formattedRegistrations = Array.from(teamMap.values());
    }

    res.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        eventType: event.eventType,
        date: event.date,
        venue: event.venue
      },
      registrations: formattedRegistrations,
      totalRegistrations: registrations.length,
      paidRegistrations: registrations.filter(r => r.paymentStatus === 'paid').length,
      pendingRegistrations: registrations.filter(r => r.paymentStatus === 'pending').length
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

// Clear all registrations (Superadmin only)
router.delete('/registrations/clear-all', protect, authorize('superadmin'), asyncHandler(async (req, res) => {
  try {
    console.log('Admin request to clear all registrations received');
    
    // Delete all registration documents
    const deleteResult = await EventRegistration.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} registration documents`);
    
    // Clear registrations array from all events
    const updateResult = await Event.updateMany(
      {}, 
      { $set: { registrations: [] } }
    );
    console.log(`Updated ${updateResult.modifiedCount} events to remove registrations`);
    
    res.json({
      success: true,
      message: 'All registrations have been cleared successfully',
      deletedCount: deleteResult.deletedCount,
      eventsUpdated: updateResult.modifiedCount
    });
  } catch (err) {
    console.error('Error clearing all registrations:', err);
    res.status(500).json({
      success: false,
      message: 'Error clearing registrations',
      error: err.message
    });
  }
}));

module.exports = router;
