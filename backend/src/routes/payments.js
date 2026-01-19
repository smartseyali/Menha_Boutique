const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Create payment order
router.post('/create-order', optionalAuth, paymentController.createPaymentOrder);

// Verify payment
router.post('/verify', optionalAuth, paymentController.verifyPayment);

// Verify payment link (from callback)
router.post('/verify-link', optionalAuth, paymentController.verifyPaymentLink);

// Webhook handlers (no authentication required, but signature verification is done)
router.post('/webhook/razorpay', paymentController.razorpayWebhook);
router.post('/webhook/phonepe', paymentController.phonepeWebhook);

module.exports = router;

