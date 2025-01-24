const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const events = [
  {
    title: 'Ideathon (Junior Edition)',
    description: 'The "Ideathon (Junior Edition)" was a landmark event aimed at fostering creativity, teamwork, and innovation among students from grades 8 to 12.',
    date: '2024-09-14',
    end_date: '2024-10-04',
    venue: 'Shershah Engineering College, Sasaram',
    type: 'past'
  },
  {
    title: '4-Day Web Development Bootcamp',
    description: 'The 4-Day Web Development Bootcamp is an exciting opportunity for students to learn, explore, and master web development skills in a highly interactive and hands-on environment.',
    date: '2025-02-04',
    end_date: '2025-02-07',
    venue: 'Shershah Engineering College, Sasaram',
    type: 'upcoming'
  },
  {
    title: 'Introduction to Robotics and IoT Workshop',
    description: 'Explore the cutting-edge fields of robotics and IoT in this comprehensive 4-day workshop, designed for students who want to step into the future of technology.',
    date: '2025-02-04',
    end_date: '2025-02-07',
    venue: 'Shershah Engineering College, Sasaram',
    type: 'upcoming'
  }
];

const addEvents = async () => {
  try {
    await Event.insertMany(events);
    console.log('Events added successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error adding events:', err);
    mongoose.connection.close();
  }
};

addEvents();
