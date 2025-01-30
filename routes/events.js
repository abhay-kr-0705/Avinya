const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { protect, authorize } = require('../middleware/auth');
const { sendEventConfirmation } = require('../utils/email');

// Get user's registrations - IMPORTANT: This must come before other routes
router.get('/registrations', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const registrations = await EventRegistration.find({ email })
      .populate('event')
      .lean();

    const registrationData = registrations
      .filter(reg => reg.event) // Filter out any registrations where event is null
      .map(reg => ({
        event: reg.event._id,
        email: reg.email,
        status: reg.status,
        created_at: reg.created_at
      }));

    res.json(registrationData);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Get all event registrations for an event (admin only) - IMPORTANT: This must come before /:id routes
router.get('/:eventId/registrations', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // First check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get all registrations for this event
    const registrations = await EventRegistration.find({ event: eventId })
      .select('name email registration_no mobile_no semester status created_at')
      .sort({ created_at: -1 });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events (public access)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
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
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Register for event
router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'registration_no', 'mobile_no', 'semester'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if already registered with the same email
    const existingReg = await EventRegistration.findOne({
      event: req.params.id,
      email: req.body.email
    });

    if (existingReg) {
      return res.status(400).json({ message: 'Already registered for this event with this email' });
    }

    const registration = await EventRegistration.create({
      event: req.params.id,
      name: req.body.name,
      email: req.body.email,
      registration_no: req.body.registration_no,
      mobile_no: req.body.mobile_no,
      semester: req.body.semester,
      status: 'registered'
    });

    // Send confirmation email
    try {
      await sendEventConfirmation(req.body.email, event, registration);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message: 'Successfully registered for the event',
      registration
    });
  } catch (err) {
    console.error('Error registering for event:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error registering for event' });
  }
});

// Create event (Admin only)
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event' });
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
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Error updating event' });
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
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;
