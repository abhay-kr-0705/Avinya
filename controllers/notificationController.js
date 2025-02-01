const admin = require('../config/firebase-config');

/**
 * Send notification to specific FCM tokens
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string[]} tokens - Array of FCM tokens
 * @returns {Promise} Firebase messaging response
 */
const sendNotification = async (title, message, tokens) => {
  console.log('Sending notification:', { title, message, tokensCount: tokens.length });

  if (!tokens || tokens.length === 0) {
    throw new Error('No valid FCM tokens provided');
  }

  if (!title || !message) {
    throw new Error('Title and message are required');
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
    console.log('Successfully sent notifications:', {
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    if (response.failureCount > 0) {
      console.log('Failed notifications:', 
        response.responses.map((resp, idx) => ({
          token: tokens[idx],
          error: resp.error?.message
        }))
      );
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('Firebase messaging error:', error);
    throw new Error(`Failed to send notifications: ${error.message}`);
  }
};

module.exports = {
  sendNotification
};
