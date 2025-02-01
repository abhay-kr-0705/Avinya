const admin = require('../config/firebase-config');

// Send notification to specific FCM tokens
const sendNotification = async (title, message, tokens) => {
  if (!tokens || tokens.length === 0) {
    throw new Error('No valid FCM tokens provided');
  }

  const notification = {
    notification: {
      title,
      body: message
    },
    tokens
  };

  try {
    const response = await admin.messaging().sendMulticast(notification);
    console.log('Successfully sent notifications:', response);
    return response;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

module.exports = {
  sendNotification
};
