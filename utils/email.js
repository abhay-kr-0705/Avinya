const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendEventConfirmation = async (to, event, registration) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: `Registration Confirmation - ${event.title}`,
    html: `
      <h2>Event Registration Confirmation</h2>
      <p>Dear ${registration.name},</p>
      <p>Thank you for registering for ${event.title}!</p>
      
      <h3>Event Details:</h3>
      <p>Date: ${event.start_date.toLocaleDateString()} - ${event.end_date.toLocaleDateString()}</p>
      <p>Location: ${event.location}</p>
      
      <h3>Your Registration Details:</h3>
      <p>Name: ${registration.name}</p>
      <p>Registration No: ${registration.registration_no}</p>
      <p>Email: ${registration.email}</p>
      
      <p>Please keep this email as your ticket for the event.</p>
      
      <p>Best regards,<br>GenX Developers Club</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
