const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const sampleEvents = [
  {
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React and Node.js. Build real-world projects and enhance your development skills.',
    date: new Date('2025-02-15'),
    end_date: new Date('2025-02-16'),
    venue: 'Tech Hub, Room 301',
    type: 'upcoming'
  },
  {
    title: 'AI/ML Bootcamp',
    description: 'Deep dive into Artificial Intelligence and Machine Learning. Hands-on experience with Python and popular ML frameworks.',
    date: new Date('2025-03-01'),
    end_date: new Date('2025-03-02'),
    venue: 'Innovation Center',
    type: 'upcoming'
  },
  {
    title: 'Hackathon 2024',
    description: 'Annual coding competition. Form teams, solve real-world problems, and win exciting prizes!',
    date: new Date('2024-12-15'),
    end_date: new Date('2024-12-16'),
    venue: 'Main Auditorium',
    type: 'past'
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Insert sample events
    await Event.insertMany(sampleEvents);
    console.log('Sample events inserted');

    mongoose.connection.close();
    console.log('Database connection closed');
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
