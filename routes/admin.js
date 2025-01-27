const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes in this router
router.use(protect);
router.use(authorize('admin'));

// Get all events with registrations
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: -1 })
      .populate('registrations.userId', 'name email registration_no');
    res.json(events);
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [totalEvents, totalUsers, totalRegistrations] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Event.aggregate([
        { $unwind: '$registrations' },
        { $group: { _id: null, count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      totalEvents,
      totalUsers,
      totalRegistrations: totalRegistrations[0]?.count || 0,
      upcomingEvents: await Event.countDocuments({ type: 'upcoming' }),
      pastEvents: await Event.countDocuments({ type: 'past' })
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get event registrations
router.get('/events/:id/registrations', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.userId', 'name email registration_no');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event.registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Error fetching event registrations' });
  }
});

module.exports = router;
