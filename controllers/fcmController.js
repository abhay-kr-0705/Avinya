const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.updateFCMToken = catchAsync(async (req, res) => {
  const { fcmToken } = req.body;
  
  if (!fcmToken) {
    return res.status(400).json({
      status: 'error',
      message: 'FCM token is required'
    });
  }

  await User.findByIdAndUpdate(req.user._id, { fcmToken });

  res.status(200).json({
    status: 'success',
    message: 'FCM token updated successfully'
  });
});
