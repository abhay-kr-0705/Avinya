const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  registration_no: {
    type: String,
    required: true
  },
  mobile_no: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  registered_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['upcoming', 'past'],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  registration_link: {
    type: String
  },
  coordinators: [{
    type: String
  }],
  details: [{
    type: String
  }],
  registrations: [registrationSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add a method to check if an event is upcoming
eventSchema.methods.isUpcoming = function() {
  return new Date(this.date) > new Date();
};

// Automatically update type based on date
eventSchema.pre('save', function(next) {
  this.type = this.isUpcoming() ? 'upcoming' : 'past';
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
