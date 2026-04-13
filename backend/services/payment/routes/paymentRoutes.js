const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  getSessionDetails,
  processRefund
} = require('../controllers/paymentController');
const { verifyTokenViaAuthService } = require('../../../shared/middleware/auth');
const { isAdmin } = require('../../../shared/middleware/rbac');

// Webhook route
// Raw body is captured by the payment service JSON parser verify() hook (req.rawBody).
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-checkout-session', verifyTokenViaAuthService, createCheckoutSession);
router.get('/session/:sessionId', verifyTokenViaAuthService, getSessionDetails);

// Admin routes
router.post('/refund', verifyTokenViaAuthService, isAdmin, processRefund);

module.exports = router;
