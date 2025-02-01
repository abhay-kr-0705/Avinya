const admin = require('../config/firebase-config');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// Send notification to all users or targeted users
exports.sendNotification = catchAsync(async (req, res) => {
  const { title, message, type, userIds } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Title and message are required'
    });
  }

  let tokens = [];

  if (type === 'targeted' && userIds && userIds.length > 0) {
    // Get FCM tokens for specific users
    const users = await User.find({
      _id: { $in: userIds },
      fcmToken: { $exists: true, $ne: null }
    });
    tokens = users.map(user => user.fcmToken);
  } else {
    // Get FCM tokens for all users
    const users = await User.find({
      fcmToken: { $exists: true, $ne: null }
    });
    tokens = users.map(user => user.fcmToken);
  }

  if (tokens.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No users with valid FCM tokens found'
    });
  }

  const message = {
    notification: {
      title,
      body: message
    },
    tokens
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent notifications:', response.successCount);
    
    if (response.failureCount > 0) {
      console.log('Failed notifications:', response.failureCount);
      // Clean up invalid tokens
      response.responses.forEach(async (resp, idx) => {
        if (!resp.success) {
          const token = tokens[idx];
          await User.updateMany(
            { fcmToken: token },
            { $unset: { fcmToken: "" } }
          );
        }
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Successfully sent ${response.successCount} notifications`,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send notifications'
    });
  }
});
