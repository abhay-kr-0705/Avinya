const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const { sendEventConfirmation } = require('../utils/email');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { eventId, registrationId, amount } = req.body;

    console.log('Creating payment order with params:', { 
      eventId, 
      registrationId, 
      amount, 
      userId: req.user?._id,
      razorpayKey: process.env.RAZORPAY_KEY_ID
    });

    if (!eventId || !registrationId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, registration ID and amount are required'
      });
    }

    // Check if registration exists and is pending payment
    const registration = await EventRegistration.findOne({
      _id: registrationId,
      event: eventId
    });

    if (!registration) {
      console.error(`Registration not found: ${registrationId} for event ${eventId}`);
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // If payment is already completed, return existing information
    if (registration.paymentStatus === 'completed') {
      console.log(`Payment already completed for registration: ${registrationId}`);
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this registration'
      });
    }

    // Verify that we are using the correct Razorpay API key
    console.log('Using Razorpay keys:', {
      key_id: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...',
      key_secret: process.env.RAZORPAY_KEY_SECRET ? 'Valid' : 'Missing'
    });

    // Initialize the Razorpay instance with the latest keys
    const razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${registrationId}`,
      payment_capture: 1,
      notes: {
        eventId,
        registrationId
      }
    };

    console.log('Razorpay order options:', options);

    try {
      const order = await razorpayClient.orders.create(options);
      console.log('Razorpay order created successfully:', order);

      res.json({
        success: true,
        order
      });
    } catch (razorpayError) {
      console.error('Razorpay API Error:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Error communicating with payment gateway',
        error: razorpayError.message || 'Unknown Razorpay error'
      });
    }
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message || 'Unknown server error'
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

    console.log('Verifying payment:', { 
      razorpay_order_id, 
      razorpay_payment_id, 
      eventId, 
      registrationId 
    });

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

      // Update both payment and registration status
      registration.paymentStatus = 'completed';
      registration.paymentId = razorpay_payment_id;
      registration.orderId = razorpay_order_id;
      registration.status = 'confirmed'; // Confirm registration after successful payment
      await registration.save();

      // Send confirmation email after successful payment
      try {
        const event = await Event.findById(eventId);
        await sendEventConfirmation(registration.email, event, registration);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the payment verification if email fails
      }

      console.log('Payment verified and registration confirmed:', registration._id);

      res.json({
        success: true,
        message: 'Payment verified and registration confirmed successfully'
      });
    } else {
      console.error('Invalid payment signature');
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: err.message
    });
  }
});

// Test Razorpay connectivity
router.get('/test-connection', async (req, res) => {
  try {
    console.log('Testing Razorpay connection with keys:', {
      key_id: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...',
      key_secret: process.env.RAZORPAY_KEY_SECRET ? 'Valid' : 'Missing'
    });

    // Initialize a fresh instance
    const testRazorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Try to create a test order with minimum amount
    const testOrder = await testRazorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
      payment_capture: 0,
      notes: { test: 'true' }
    });

    console.log('Test order created successfully:', testOrder);

    res.json({
      success: true,
      message: 'Razorpay connection successful',
      testOrder
    });
  } catch (error) {
    console.error('Razorpay connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay connection test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 