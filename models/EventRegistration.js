const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  registration_no: {
    type: String,
    required: [true, 'Please provide your registration number']
  },
  mobile_no: {
    type: String,
    required: [true, 'Please provide your mobile number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  semester: {
    type: String,
    required: [true, 'Please provide your semester']
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled'],
    default: 'registered'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
