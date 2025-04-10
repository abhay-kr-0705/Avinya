require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeUserAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genx');
        console.log('Connected to MongoDB');

        // First find the user
        const user = await User.findOne({ email: 'abhayk7481@gmail.com' });
        if (user) {
            console.log('Found user:', {
                email: user.email,
                currentRole: user.role,
                _id: user._id
            });

            // Update to admin role
            user.role = 'admin';
            await user.save();

            console.log('Successfully updated user role to admin');
            console.log('Updated user:', {
                email: user.email,
                newRole: user.role,
                _id: user._id
            });
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

makeUserAdmin();
