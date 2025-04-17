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
    validate: {
      validator: function(v) {
        // Remove any non-digit characters (including +)
        const digits = v.replace(/\D/g, '');
        // Check if the remaining digits form a valid mobile number
        // For Indian numbers: either 10 digits, or 11-12 digits starting with country code
        return /^(\d{10}|\d{11,12})$/.test(digits);
      },
      message: 'Please provide a valid mobile number'
    }
  },
  semester: {
    type: String,
    required: [true, 'Please provide your semester']
  },
  teamName: {
    type: String,
    default: null
  },
  isLeader: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  orderId: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
eventRegistrationSchema.index({ event: 1, email: 1 });
eventRegistrationSchema.index({ teamName: 1 });
eventRegistrationSchema.index({ created_at: -1 });
eventRegistrationSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
