const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { protect, authorize } = require('../middleware/auth');
const { sendEventConfirmation } = require('../utils/email');

// Get all events (public access)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get single event
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get admin events
router.get('/admin/events', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const events = await Event.find()
      .sort({ date: -1 })
      .lean();

    res.json(events);
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create event (Admin only)
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update event (Admin only)
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete event (Admin only)
router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Delete all registrations for this event
    await EventRegistration.deleteMany({ event: req.params.id });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user registrations
router.get('/user-registrations', protect, async (req, res) => {
  try {
    const events = await Event.find({
      'registrations.userId': req.user._id
    }).select('title date registrations.$');
    
    const registrations = events.map(event => ({
      eventId: event._id,
      title: event.title,
      date: event.date,
      registration: event.registrations[0]
    }));

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ message: 'Error fetching user registrations' });
  }
});

// Register for an event
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered
    if (event.registrations.some(reg => reg.userId.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.registrations.push({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      registration_no: req.user.registration_no,
      mobile_no: req.user.mobile_no,
      semester: req.user.semester
    });

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Error registering for event' });
  }
});

// Get event registrations (admin only)
router.get('/:id/registrations', protect, authorize('admin', 'superadmin'), async (req, res) => {
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

// Get dashboard stats
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const now = new Date();
    
    const [totalEvents, upcomingEvents, pastEvents, registrationsResult] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ date: { $gt: now } }),
      Event.countDocuments({ date: { $lte: now } }),
      Event.aggregate([
        { $unwind: { path: '$registrations', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: { $cond: [{ $ifNull: ['$registrations', false] }, 1, 0] } } } }
      ])
    ]);

    res.json({
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations: registrationsResult[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
