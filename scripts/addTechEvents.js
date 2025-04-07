const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

dotenv.config();

const techEvents = [
  // Robotics & Engineering Events
  {
    title: 'Line Follower – TrailBlazer Bot',
    description: 'Build an autonomous robot that follows a winding path of black/white lines, tackling curves and junctions.',
    date: '2024-05-07',
    end_date: '2024-05-07',
    venue: 'Robotics Lab, Main Building',
    type: 'upcoming',
    eventType: 'individual',
    fee: 49,
    maxTeamSize: 1,
    rulebook: 'Only autonomous bots allowed. Fastest bot to finish the track without derailing wins. Penalty added for going off-track.'
  },
  {
    title: 'Robo Kickoff – Mecha Soccer',
    description: 'Robots battle in a mini soccer match, pushing a soft ball to score goals.',
    date: '2024-05-07',
    end_date: '2024-05-07',
    venue: 'Robotics Lab, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 2,
    rulebook: '1v1 or 2v2 format. Only safe, non-damaging mechanisms allowed. Match time: 3 minutes. Highest goals win.'
  },
  {
    title: 'Hurdle Hustler – BotCross Challenge',
    description: 'Guide your robot through physical obstacles like ramps and blocks.',
    date: '2024-05-08',
    end_date: '2024-05-08',
    venue: 'Robotics Lab, Main Building',
    type: 'upcoming',
    eventType: 'individual',
    fee: 49,
    maxTeamSize: 1,
    rulebook: 'Manual control allowed. Time limit: 2.5 minutes. Skipping hurdles = penalties. Fastest clean run wins.'
  },
  {
    title: 'Robo Rally – RaceTrack Rampage',
    description: 'Robots compete in an exciting race filled with curves and checkpoints.',
    date: '2024-05-08',
    end_date: '2024-05-08',
    venue: 'Robotics Lab, Main Building',
    type: 'upcoming',
    eventType: 'individual',
    fee: 49,
    maxTeamSize: 1,
    rulebook: 'Manual/semi-autonomous bots allowed. Points for time, precision, and control. Stay within track boundaries.'
  },
  {
    title: 'Bridge Making – StickStruct',
    description: 'Build a creative and strong bridge using ice cream sticks and glue.',
    date: '2024-05-09',
    end_date: '2024-05-09',
    venue: 'Engineering Lab, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 3,
    rulebook: 'Time: 2 hours. Judged on strength, load capacity, and design. Bonus for aesthetics and innovation.'
  },
  {
    title: 'Card House – Stack Master',
    description: 'Stack cards to build the tallest and most stable card house.',
    date: '2024-05-09',
    end_date: '2024-05-09',
    venue: 'Engineering Lab, Main Building',
    type: 'upcoming',
    eventType: 'individual',
    fee: 49,
    maxTeamSize: 1,
    rulebook: 'Standard playing cards only. No glue/tape/supports. Time: 30 minutes. Judged on height and stability.'
  },
  {
    title: 'DroneX: Sky\'s the Limit',
    description: 'Fly your drone through simple aerial checkpoints in a basic obstacle layout.',
    date: '2024-05-09',
    end_date: '2024-05-09',
    venue: 'Open Ground, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 2,
    rulebook: 'Solo or 2-member team. Drone must be manually controlled. Weight limit: 2kg. Simple ring checkpoints and a landing zone. Time limit: 3 minutes. Fastest and most stable flyers win.'
  },
  // Tech & Coding Events
  {
    title: 'Web Dev Showdown (Junior Edition)',
    description: 'Build a website or solve a real-world UI/UX task in limited time.',
    date: '2024-05-07',
    end_date: '2024-05-07',
    venue: 'Computer Lab 1, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 2,
    rulebook: 'Solo or 2-person teams. Theme given on the spot. Judged on responsiveness, design, and code quality. No use of pre-made templates.'
  },
  {
    title: 'Web Dev Showdown (Senior Edition)',
    description: 'Build a website or solve a real-world UI/UX task in limited time.',
    date: '2024-05-07',
    end_date: '2024-05-07',
    venue: 'Computer Lab 2, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 2,
    rulebook: 'Solo or 2-person teams. Theme given on the spot. Judged on responsiveness, design, and code quality. No use of pre-made templates.'
  },
  {
    title: 'Code Clash – DSA Arena',
    description: 'Solve programming problems in a time-limited coding battle.',
    date: '2024-05-08',
    end_date: '2024-05-08',
    venue: 'Computer Lab 1, Main Building',
    type: 'upcoming',
    eventType: 'individual',
    fee: 49,
    maxTeamSize: 1,
    rulebook: 'Individual event. Platforms: HackerRank, Codeforces, etc. Time: 90–120 minutes. Scoring based on difficulty and accuracy.'
  },
  {
    title: 'CTF – Capture The Flag',
    description: 'Explore ethical hacking and cybersecurity challenges to "capture the flag".',
    date: '2024-05-08',
    end_date: '2024-05-08',
    venue: 'Computer Lab 2, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 4,
    rulebook: 'Teams of up to 4. Challenges in web, crypto, forensic, and binary. Time: 4 hours. No automated scripts or external help.'
  },
  // Fun & Brainy Events
  {
    title: 'Esports Showdown',
    description: 'Team up for high-energy gaming competitions like BGMI, Valorant, or FIFA.',
    date: '2024-05-09',
    end_date: '2024-05-09',
    venue: 'Gaming Zone, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 4,
    rulebook: 'Game-specific rules apply. Fair play is mandatory. Bring your own gear if needed. No cheating/emulators.'
  },
  {
    title: 'Treasure Hunt – CodeQuest',
    description: 'Decode clues and complete mini-tasks to find the final treasure.',
    date: '2024-05-07',
    end_date: '2024-05-07',
    venue: 'Campus-wide',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 4,
    rulebook: 'Team of max 4. Campus-wide hunt. Clues involve logic, puzzles, and challenges. Time-based scoring.'
  },
  {
    title: 'Quiz Quest',
    description: 'A fun and competitive quiz covering tech, general knowledge, and puzzles.',
    date: '2024-05-08',
    end_date: '2024-05-08',
    venue: 'Auditorium, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 2,
    rulebook: 'Team of 2. Written prelims followed by buzzer round. No use of devices. Topics: mixed domain.'
  },
  {
    title: '2D/3D Animation Battle – MotionMania',
    description: 'Create an animated short using your favorite animation tools.',
    date: '2024-05-09',
    end_date: '2024-05-09',
    venue: 'Multimedia Lab, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 2,
    rulebook: 'Solo or duo. Submit pre-made or live-project (4–6 hrs). Theme: Given on the spot or pre-defined. Judged on creativity, motion, and storytelling.'
  },
  {
    title: 'Rubik\'s Cube Sprint',
    description: 'Solve a standard 3x3 Rubik\'s Cube in the fastest time possible.',
    date: '2024-05-07',
    end_date: '2024-05-07',
    venue: 'Auditorium, Main Building',
    type: 'upcoming',
    eventType: 'individual',
    fee: 49,
    maxTeamSize: 1,
    rulebook: 'One attempt per participant. Bring your own cube (standard only). No lubricants/mods. Timer-based scoring.'
  },
  {
    title: 'Art & Craft – Craftopia',
    description: 'Showcase your creativity with handmade art and crafts.',
    date: '2024-05-08',
    end_date: '2024-05-08',
    venue: 'Art Room, Main Building',
    type: 'upcoming',
    eventType: 'group',
    fee: 49,
    maxTeamSize: 2,
    rulebook: 'Solo or pair participation. Bring your own materials. Time: 1.5 hours. Judged on creativity, neatness, and theme expression.'
  }
];

const addEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Insert new events
    await Event.insertMany(techEvents);
    console.log('Tech events added successfully');

    mongoose.connection.close();
  } catch (err) {
    console.error('Error adding events:', err);
    mongoose.connection.close();
  }
};

addEvents(); 