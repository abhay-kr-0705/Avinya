const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
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
}, { _id: false });

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
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['upcoming', 'past'],
    required: true
  },
  registrations: [registrationSchema],
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

// Add indexes for better query performance
eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ 'registrations.userId': 1 });

// Pre-save middleware to update timestamps
eventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function() {
  return new Date(this.date) < new Date();
});

// Method to check if a user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.registrations.some(reg => reg.userId.toString() === userId.toString());
};

// Configure toJSON transform
eventSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Remove sensitive registration data when not needed
    if (ret.registrations) {
      ret.registrations = ret.registrations.map(reg => ({
        id: reg._id,
        userId: reg.userId,
        name: reg.name,
        registrationDate: reg.registrationDate
      }));
    }
    return ret;
  }
});

// Add virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

module.exports = mongoose.model('Event', eventSchema);
