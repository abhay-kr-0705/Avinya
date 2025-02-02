const admin = require('../config/firebase-config');

// Send notification to specific FCM tokens
const sendNotification = async (title, message, tokens) => {
  console.log('Sending notification:', { title, message });
  console.log('Number of tokens:', tokens.length);
  
  if (!tokens || tokens.length === 0) {
    throw new Error('No valid FCM tokens provided');
  }

  const messagePayload = {
    notification: {
      title,
      body: message
    },
    tokens
  };

  try {
    console.log('Sending FCM notification with payload:', messagePayload);
    const response = await admin.messaging().sendMulticast(messagePayload);
    console.log('FCM Response:', response);
    
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({
            token: tokens[idx],
            error: resp.error
          });
        }
      });
      console.log('Failed to send to some tokens:', failedTokens);
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      failures: response.responses.filter(r => !r.success).map((r, i) => ({
        token: tokens[i],
        error: r.error?.message
      }))
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

module.exports = {
  sendNotification
};
