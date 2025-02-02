const express = require('express');
const { updateFCMToken } = require('../controllers/fcmController');
const { sendTestNotification } = require('../controllers/testNotification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/token', protect, updateFCMToken);
router.post('/test-notification', protect, async (req, res) => {
  try {
    await sendTestNotification();
    res.status(200).json({ message: 'Test notification sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

module.exports = router;
