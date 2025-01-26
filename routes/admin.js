const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Protect all admin routes
router.use(auth);
router.use(admin);

// Get all events with registration counts
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    const eventsWithRegistrations = await Promise.all(
      events.map(async (event) => {
        const registrations = await Event.countDocuments({ _id: event._id });
        return {
          ...event.toObject(),
          registrations,
        };
      })
    );
    res.json(eventsWithRegistrations);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event
router.post('/events', async (req, res) => {
  try {
    const { title, description, date, time, venue } = req.body;
    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      status: new Date(date) > new Date() ? 'upcoming' : 'past',
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/events/:id', async (req, res) => {
  try {
    const { title, description, date, time, venue } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        date,
        time,
        venue,
        status: new Date(date) > new Date() ? 'upcoming' : 'past',
      },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
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
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
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
});

// Get all events with registration details
router.get('/events/all', async (req, res) => {
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
});

// Get event registrations
router.get('/events/:id/registrations', async (req, res) => {
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
});

module.exports = router;
