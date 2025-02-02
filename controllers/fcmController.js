const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.updateFCMToken = catchAsync(async (req, res) => {
  const { fcmToken } = req.body;
  
  console.log('Updating FCM token for user:', req.user._id);
  console.log('FCM Token:', fcmToken);
  
  if (!fcmToken) {
    console.log('No FCM token provided');
    return res.status(400).json({
      status: 'error',
      message: 'FCM token is required'
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id, 
    { fcmToken },
    { new: true }
  );

  console.log('User updated with FCM token:', updatedUser);

  res.status(200).json({
    status: 'success',
    message: 'FCM token updated successfully'
  });
});
