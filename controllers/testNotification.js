const admin = require('../config/firebase-config');

const sendTestNotification = async () => {
  try {
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from GenX Events!'
      },
      topic: 'all' // This will send to all subscribed devices
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent test notification:', response);
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};

module.exports = { sendTestNotification };
