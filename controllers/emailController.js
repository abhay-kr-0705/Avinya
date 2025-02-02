const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// Send email to selected users
exports.sendEmailToUsers = async (req, res) => {
  try {
    const { userIds, subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get user emails based on userIds
    let users;
    if (userIds && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } });
    } else {
      users = await User.find();
    }

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'No users found'
      });
    }

    const emails = users.map(user => user.email);

    // Send email
    await sendEmail({
      to: emails,
      subject,
      html: content
    });

    res.json({
      success: true,
      message: `Email sent successfully to ${emails.length} users`
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
