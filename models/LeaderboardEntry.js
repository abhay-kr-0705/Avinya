const mongoose = require('mongoose');

const LeaderboardEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: false,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  college: {
    type: String,
    required: [true, 'Please provide a college name'],
    trim: true
  },
  eventName: {
    type: String,
    required: [true, 'Please provide an event name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Please provide a position'],
    trim: true
  },
  points: {
    type: Number,
    required: [true, 'Please provide points'],
    min: [0, 'Points cannot be negative']
  },
  year: {
    type: String,
    required: [true, 'Please provide a year'],
    trim: true
  },
  thumbnail: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaderboardEntry', LeaderboardEntrySchema); 