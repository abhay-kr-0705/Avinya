const admin = require('../config/firebase-config');
const User = require('../models/User');

const sendNotificationToAllUsers = async (title, body) => {
  try {
    // Get all users' FCM tokens
    const users = await User.find({ fcmToken: { $exists: true } });
    const tokens = users.map(user => user.fcmToken).filter(token => token);

    if (tokens.length === 0) {
      console.log('No users with FCM tokens found');
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent notifications:', response.successCount);
    if (response.failureCount > 0) {
      console.log('Failed notifications:', response.failureCount);
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

module.exports = {
  sendNotificationToAllUsers,
};
