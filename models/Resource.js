const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['document', 'video', 'link']
  },
  domain: {
    type: String,
    required: false,
    enum: [
      'Web Development',
      'AI and ML',
      'Data Science',
      'Cybersecurity',
      'Cloud Computing',
      'DevOps',
      'Blockchain',
      'UI/UX Design',
      'Competitive Programming',
      'Robotics and IoT',
      'Creativity',
      'Outreach',
      'Other'
    ]
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('Resource', resourceSchema);
