const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse, errorResponse } = require('../../../shared/utils/helpers');

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create Stripe checkout session
 * @access  Private
 */
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body || {};

  if (!orderId) {
    return errorResponse(res, 400, 'Order ID is required');
  }

  // Get order details from Cart/Order Service
  const cartOrderServiceUrl = process.env.CART_ORDER_SERVICE_URL || 'http://localhost:5004';
  let orderResponse;

  try {
    orderResponse = await axios.get(
      `${cartOrderServiceUrl}/api/orders/${orderId}`,
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );
  } catch (error) {
    return errorResponse(res, 404, 'Order not found');
  }

  const order = orderResponse.data.data.order;

  // Check if order belongs to user
  if (order.userId !== req.user.id) {
    return errorResponse(res, 403, 'Access denied');
  }

  // Check if order is already paid
  if (order.paymentStatus === 'paid') {
    return errorResponse(res, 400, 'Order is already paid');
  }

  // Create line items for Stripe
  const lineItems = order.items.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.name,
        images: item.imageUrl ? [`${process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003'}${item.imageUrl}`] : []
      },
      unit_amount: Math.round(item.price * 100) // Convert to the smallest currency unit (paise)
    },
    quantity: item.quantity
  }));

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`,
    metadata: {
      orderId: orderId,
      userId: req.user.id
    }
  });

  successResponse(res, 200, 'Checkout session created successfully', {
    sessionId: session.id,
    url: session.url
  });
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (but verified by Stripe signature)
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!req.rawBody) {
      return res.status(400).send('Webhook Error: Missing raw body');
    }
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Update order payment status
      const orderId = session.metadata.orderId;
      const cartOrderServiceUrl = process.env.CART_ORDER_SERVICE_URL || 'http://localhost:5004';

      try {
        await axios.put(
          `${cartOrderServiceUrl}/api/orders/${orderId}/payment`,
          {
            paymentId: session.payment_intent,
            paymentStatus: 'paid'
          },
          {
            headers: {
              'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY
            }
          }
        );

        console.log(`Payment successful for order ${orderId}`);
      } catch (error) {
        console.error('Failed to update order payment status:', error.message);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.log('Payment failed:', failedIntent.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * @route   GET /api/payments/session/:sessionId
 * @desc    Get checkout session details
 * @access  Private
 */
const getSessionDetails = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  successResponse(res, 200, 'Session details retrieved successfully', {
    session: {
      id: session.id,
      status: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata
    }
  });
});

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund (admin only)
 * @access  Private/Admin
 */
const processRefund = asyncHandler(async (req, res) => {
  const { paymentIntentId, amount } = req.body;

  if (!paymentIntentId) {
    return errorResponse(res, 400, 'Payment intent ID is required');
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined // If amount not specified, refund full amount
  });

  successResponse(res, 200, 'Refund processed successfully', {
    refund: {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    }
  });
});

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getSessionDetails,
  processRefund
};
