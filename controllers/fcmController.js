const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.updateFCMToken = catchAsync(async (req, res) => {
  console.log('Updating FCM token. Request body:', req.body);
  console.log('User:', req.user._id);
  
  const { fcmToken } = req.body;
  
  if (!fcmToken) {
    console.log('No FCM token provided in request');
    return res.status(400).json({
      status: 'error',
      message: 'FCM token is required'
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fcmToken },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    console.log('User updated successfully:', {
      userId: updatedUser._id,
      fcmToken: updatedUser.fcmToken
    });

    res.status(200).json({
      status: 'success',
      message: 'FCM token updated successfully',
      data: {
        userId: updatedUser._id,
        fcmToken: updatedUser.fcmToken
      }
    });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update FCM token',
      error: error.message
    });
  }
});
