const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const EventRegistration = require('../models/EventRegistration');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { eventId, registrationId, amount } = req.body;

    if (!eventId || !registrationId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, registration ID and amount are required'
      });
    }

    // Check if registration exists and is pending payment
    const registration = await EventRegistration.findOne({
      _id: registrationId,
      event: eventId,
      paymentStatus: 'pending'
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found or payment already completed'
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${registrationId}`,
      payment_capture: 1,
      notes: {
        eventId,
        registrationId
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      registrationId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !eventId || !registrationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Update registration status
      const registration = await EventRegistration.findOne({
        _id: registrationId,
        event: eventId,
        paymentStatus: 'pending'
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found or payment already completed'
        });
      }

      registration.paymentStatus = 'completed';
      registration.paymentId = razorpay_payment_id;
      registration.orderId = razorpay_order_id;
      registration.status = 'confirmed';
      await registration.save();

      res.json({
        success: true,
        message: 'Payment verified and registration confirmed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

module.exports = router; 