const Order = require('../models/Order');
const Cart = require('../models/Cart');
const axios = require('axios');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse, errorResponse, getPagination } = require('../../../shared/utils/helpers');

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || cart.items.length === 0) {
        return errorResponse(res, 400, 'Cart is empty');
    }

    // Create order
    const order = await Order.create({
        userId: req.user.id,
        items: cart.items,
        totalAmount: cart.totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress
    });

    successResponse(res, 201, 'Order created successfully', { order });
});

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
const getUserOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const total = await Order.countDocuments({ userId: req.user.id });

    const orders = await Order.find({ userId: req.user.id })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const pagination = getPagination(page, limit, total);

    successResponse(res, 200, 'Orders retrieved successfully', {
        orders,
        pagination
    });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return errorResponse(res, 404, 'Order not found');
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Access denied');
    }

    successResponse(res, 200, 'Order retrieved successfully', { order });
});

/**
 * @route   GET /api/orders/all/list
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status,
        paymentStatus
    } = req.query;

    const query = {};

    if (status) {
        query.status = status;
    }

    if (paymentStatus) {
        query.paymentStatus = paymentStatus;
    }

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    // Enrich user info from User Service (users live in a separate service/DB)
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5002';
    const authHeader = req.headers.authorization;

    const userIds = Array.from(
        new Set(
            orders
                .map((o) => o.userId?.toString())
                .filter(Boolean)
        )
    );

    const usersById = {};

    if (authHeader && userIds.length > 0) {
        await Promise.all(
            userIds.map(async (id) => {
                try {
                    const response = await axios.get(`${userServiceUrl}/api/users/${id}`, {
                        headers: { Authorization: authHeader }
                    });

                    // User service uses shared `successResponse`
                    const user = response.data?.data?.user;
                    if (user) {
                        usersById[id] = {
                            _id: user._id || id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        };
                    }
                } catch (error) {
                    // Non-fatal: fallback to id-only display in UI
                }
            })
        );
    }

    const ordersWithUsers = orders.map((order) => {
        const orderObj = order.toObject();
        const uid = order.userId?.toString();
        return {
            ...orderObj,
            user: uid ? usersById[uid] || null : null
        };
    });

    const pagination = getPagination(page, limit, total);

    successResponse(res, 200, 'All orders retrieved successfully', {
        orders: ordersWithUsers,
        pagination
    });
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return errorResponse(res, 404, 'Order not found');
    }

    order.status = status;
    await order.save();

    successResponse(res, 200, 'Order status updated successfully', { order });
});

/**
 * @route   PUT /api/orders/:id/payment
 * @desc    Update order payment status
 * @access  Private (called by payment service)
 */
const updateOrderPayment = asyncHandler(async (req, res) => {
    const { paymentId, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return errorResponse(res, 404, 'Order not found');
    }

    order.paymentId = paymentId;
    order.paymentStatus = paymentStatus;

    if (paymentStatus === 'paid') {
        order.status = 'processing';

        // Decrement product quantities
        const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';

        for (const item of order.items) {
            try {
                // Get current product
                const productResponse = await axios.get(
                    `${productServiceUrl}/api/products/${item.productId}`,
                    {
                        headers: {
                            'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY
                        }
                    }
                );
                const product = productResponse.data.data.product;

                // Update stock
                const newQuantity = product.quantity - item.quantity;
                await axios.put(
                    `${productServiceUrl}/api/products/${item.productId}/stock`,
                    { quantity: Math.max(0, newQuantity) },
                    {
                        headers: {
                            'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY
                        }
                    }
                );
            } catch (error) {
                console.error(`Failed to update stock for product ${item.productId}:`, error.message);
            }
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { userId: order.userId },
            { items: [] }
        );
    }

    await order.save();

    successResponse(res, 200, 'Order payment updated successfully', { order });
});

/**
 * @route   GET /api/orders/stats/overview
 * @desc    Get order statistics (admin only)
 * @access  Private/Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Calculate total revenue (completed orders with paid status)
    const revenueResult = await Order.aggregate([
        {
            $match: {
                status: 'completed',
                paymentStatus: 'paid'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
            }
        }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    successResponse(res, 200, 'Order statistics retrieved successfully', {
        stats: {
            totalOrders,
            pendingOrders,
            processingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue
        }
    });
});

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderPayment,
    getOrderStats
};
