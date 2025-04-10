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
    console.log('Fetching all events...');
    
    // Get all events and sort by date
    const events = await Event.find()
      .sort({ date: 1 })
      .lean();
    
    console.log(`Found ${events.length} events`);
    
    // Validate and normalize each event
    const normalizedEvents = events.map(event => {
      const now = new Date();
      const eventDate = new Date(event.date);
      
      return {
        ...event,
        id: event._id,
        // Ensure required fields have default values
        title: event.title || 'Untitled Event',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString() : now.toISOString(),
        end_date: event.end_date ? new Date(event.end_date).toISOString() : 
                 event.date ? new Date(event.date).toISOString() : now.toISOString(),
        venue: event.venue || 'TBD',
        // Set type based on date
        type: eventDate > now ? 'upcoming' : 'past',
        // Ensure optional fields have proper defaults
        eventType: event.eventType === 'group' ? 'group' : 'individual',
        fee: typeof event.fee === 'number' ? event.fee : 0,
        maxTeamSize: event.eventType === 'group' && event.maxTeamSize ? 
                    Number(event.maxTeamSize) : undefined,
        thumbnail: event.thumbnail || ''
      };
    });
    
    console.log('Normalized events:', normalizedEvents.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      type: e.type
    })));
    
    res.json(normalizedEvents);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ 
      message: 'Error fetching events',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
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
      return res.status(400).json({ 
        message: 'Already registered for this event',
        registration: existingReg
      });
    }

    // Create registration with pending status
    const registration = await EventRegistration.create({
      event: req.params.id,
      name: req.body.name,
      email: req.body.email,
      registration_no: req.body.registration_no,
      mobile_no: req.body.mobile_no,
      semester: req.body.semester,
      teamName: req.body.teamName,
      isLeader: req.body.isLeader || false,
      status: event.fee > 0 ? 'pending' : 'confirmed', // Only confirm if no payment needed
      paymentStatus: event.fee > 0 ? 'pending' : 'completed' // Set payment status based on event fee
    });

    // Send confirmation email only if no payment is required
    if (event.fee === 0) {
      try {
        await sendEventConfirmation(req.body.email, event, registration);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the registration if email fails
      }
    }

    res.status(201).json({
      message: event.fee > 0 
        ? 'Registration created successfully. Payment required to confirm registration.'
        : 'Registration confirmed successfully.',
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

// Edit registration
router.put('/:eventId/registrations/:registrationId', async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    
    // Find the registration
    const registration = await EventRegistration.findOne({
      _id: registrationId,
      event: eventId
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'mobile_no', 'semester', 'teamName'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update the registration
    const updatedRegistration = await EventRegistration.findByIdAndUpdate(
      registrationId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Registration updated successfully',
      registration: updatedRegistration
    });
  } catch (err) {
    console.error('Error updating registration:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error updating registration' });
  }
});

// Create event (Admin only)
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    console.log('Create event with data:', req.body);
    
    // Validate and sanitize input data
    const eventData = {
      ...req.body,
      // Ensure eventType is valid
      eventType: req.body.eventType === 'group' ? 'group' : 'individual',
      
      // Ensure fee is a number
      fee: req.body.fee !== undefined ? Number(req.body.fee) || 0 : 0,
      
      // Ensure maxTeamSize is a number if eventType is group
      maxTeamSize: req.body.eventType === 'group' && req.body.maxTeamSize 
                 ? Number(req.body.maxTeamSize) || 2 
                 : undefined
    };
    
    console.log('Sanitized event data for creation:', eventData);
    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Update event (Admin only)
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    console.log(`Update event ${req.params.id} with data:`, req.body);
    
    // Validate and sanitize input data
    const eventData = {
      ...req.body
    };
    
    // Ensure eventType is valid if provided
    if (req.body.eventType !== undefined) {
      eventData.eventType = req.body.eventType === 'group' ? 'group' : 'individual';
    }
    
    // Ensure fee is a number if provided
    if (req.body.fee !== undefined) {
      eventData.fee = Number(req.body.fee) || 0;
    }
    
    // Ensure maxTeamSize is a number if eventType is group
    if (req.body.eventType === 'group' && req.body.maxTeamSize !== undefined) {
      eventData.maxTeamSize = Number(req.body.maxTeamSize) || 2;
    }
    
    console.log('Sanitized event data for update:', eventData);
    const event = await Event.findByIdAndUpdate(req.params.id, eventData, {
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

// Update registration status (Admin only)
router.put('/:eventId/registrations/:registrationId/status', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      event: eventId
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.status = status;
    await registration.save();

    res.json({
      success: true,
      message: `Registration ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully`,
      registration
    });
  } catch (err) {
    console.error('Error updating registration status:', err);
    res.status(500).json({ message: 'Error updating registration status' });
  }
});

// Update payment status (Admin only)
router.put('/:eventId/registrations/:registrationId/payment', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const { status } = req.body;

    if (!['completed', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status value' });
    }

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      event: eventId
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.paymentStatus = status;
    await registration.save();

    res.json({
      success: true,
      message: `Payment marked as ${status}`,
      registration
    });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

module.exports = router;
