require('dotenv').config({ path: '../../../.env' });
const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');
const { errorHandler, notFound } = require('../../shared/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
// - We need JSON parsing for normal routes (create-checkout-session, refund, etc.)
// - We also need the raw request body for Stripe webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Payment Service is running', timestamp: new Date() });
});

// Routes
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PAYMENT_SERVICE_PORT || 5005;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
