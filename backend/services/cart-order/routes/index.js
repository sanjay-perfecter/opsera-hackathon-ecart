const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderPayment,
    getOrderStats
} = require('../controllers/orderController');
const { verifyTokenViaAuthService, verifyInternalServiceKey } = require('../../../shared/middleware/auth');
const { isAdmin } = require('../../../shared/middleware/rbac');
const { cartValidation, orderValidation, validate, idValidation } = require('../../../shared/validators');

// Order routes - Internal (for payment service)
router.put('/orders/:id/payment', verifyInternalServiceKey, [...idValidation, validate], updateOrderPayment);

// All routes require authentication
router.use(verifyTokenViaAuthService);

// Cart routes
router.get('/cart', getCart);
router.post('/cart/add', cartValidation.addToCart, validate, addToCart);
router.put('/cart/update', cartValidation.updateCart, validate, updateCartItem);
router.delete('/cart/remove/:productId', removeFromCart);
router.delete('/cart/clear', clearCart);

// Order routes - User
router.post('/orders', createOrder);
router.get('/orders', getUserOrders);
router.get('/orders/:id', [...idValidation, validate], getOrderById);

// Order routes - Admin
router.get('/orders/all/list', isAdmin, getAllOrders);
router.get('/orders/stats/overview', isAdmin, getOrderStats);
router.put(
    '/orders/:id/status',
    isAdmin,
    [...idValidation, ...orderValidation.updateStatus, validate],
    updateOrderStatus
);

module.exports = router;
