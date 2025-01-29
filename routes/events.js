const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const upcomingEvents = await Event.find({
      date: { $gt: new Date() }
    }).sort({ date: 1 });
    res.json(upcomingEvents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get past events
router.get('/past', async (req, res) => {
  try {
    const pastEvents = await Event.find({
      date: { $lt: new Date() }
    }).sort({ date: -1 });
    res.json(pastEvents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
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

// Create event (Admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user._id
    });
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update event (Admin only)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    Object.assign(event, req.body);
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete event (Admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register for event
router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot register for past events' });
    }

    // Add registration to event
    const registration = {
      name: req.body.name,
      email: req.body.email,
      registration_no: req.body.registration_no,
      mobile_no: req.body.mobile_no,
      semester: req.body.semester,
      registered_at: new Date(),
      status: 'confirmed'
    };

    event.registrations = event.registrations || [];
    event.registrations.push(registration);
    await event.save();

    res.status(201).json({
      message: 'Registration successful',
      registration
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
