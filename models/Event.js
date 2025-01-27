const mongoose = require('mongoose');

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
    type: Date
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
  registrations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    registration_no: String,
    mobile_no: String,
    semester: String,
    registrationDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

// Add index for better query performance
eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
eventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
