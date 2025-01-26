const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { protect, authorize } = require('../middleware/auth');
const { sendEventConfirmation } = require('../utils/email');

// Get all events (public access)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ start_date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

// Register for an event
router.post('/register', async (req, res) => {
  try {
    const { userId, eventId, name, email, registration_no, mobile_no, semester } = req.body;

    // Validate required fields
    if (!userId || !eventId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is already registered
    const existingRegistration = event.registrations.find(
      reg => reg.userId.toString() === userId || reg.email === email
    );

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Add registration to event
    event.registrations.push({
      userId,
      name,
      email,
      registration_no,
      mobile_no,
      semester,
      registeredAt: new Date()
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Error in event registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user registrations
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ email: req.query.email });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
