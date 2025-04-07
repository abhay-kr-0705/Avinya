const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { protect, authorize } = require('../middleware/auth');

// Register for a group event
router.post('/group', protect, async (req, res) => {
  try {
    const { eventId, teamName, teamMembers, leader } = req.body;

    // Validate event exists and is a group event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.eventType !== 'group') {
      return res.status(400).json({ message: 'This is not a group event' });
    }

    // Validate team size
    if (teamMembers.length < 2) {
      return res.status(400).json({ message: 'At least 2 team members are required' });
    }

    if (teamMembers.length > event.maxTeamSize) {
      return res.status(400).json({ message: `Maximum team size is ${event.maxTeamSize}` });
    }

    // Calculate total fee
    const totalFee = event.fee * (teamMembers.length + 1); // +1 for leader

    // Create registrations for all team members
    const registrations = await Promise.all([
      // Register leader
      EventRegistration.create({
        event: eventId,
        name: leader.name,
        email: leader.email,
        registration_no: leader.registration_no,
        mobile_no: leader.mobile_no,
        semester: leader.semester,
        teamName,
        isLeader: true
      }),
      // Register team members
      ...teamMembers.map(member => 
        EventRegistration.create({
          event: eventId,
          name: member.name,
          email: member.email,
          registration_no: member.registration_no,
          mobile_no: member.mobile_no,
          semester: member.semester,
          teamName,
          isLeader: false
        })
      )
    ]);

    // Update event registrations
    await Event.findByIdAndUpdate(eventId, {
      $push: {
        registrations: registrations.map(reg => ({
          user: reg._id,
          registered_at: new Date(),
          status: 'pending'
        }))
      }
    });

    res.status(201).json({
      message: 'Team registration successful',
      registrations,
      totalFee
    });
  } catch (error) {
    console.error('Group registration error:', error);
    res.status(500).json({ message: 'Error registering team' });
  }
});

// Get all registrations for an event (Admin only)
router.get('/event/:eventId', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ event: req.params.eventId })
      .populate('event', 'title fee')
      .sort({ created_at: -1 });

    // Group registrations by team
    const teamRegistrations = registrations.reduce((acc, reg) => {
      if (reg.teamName) {
        if (!acc[reg.teamName]) {
          acc[reg.teamName] = {
            teamName: reg.teamName,
            members: [],
            totalFee: 0
          };
        }
        acc[reg.teamName].members.push(reg);
        acc[reg.teamName].totalFee += reg.event.fee;
      } else {
        // Individual registration
        if (!acc.individuals) {
          acc.individuals = [];
        }
        acc.individuals.push(reg);
      }
      return acc;
    }, {});

    res.json(teamRegistrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Update registration status (Admin only)
router.patch('/:registrationId', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await EventRegistration.findByIdAndUpdate(
      req.params.registrationId,
      { status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ message: 'Error updating registration' });
  }
});

module.exports = router; 