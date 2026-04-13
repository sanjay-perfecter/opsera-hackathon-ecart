const Cart = require('../models/Cart');
const axios = require('axios');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse, errorResponse } = require('../../../shared/utils/helpers');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    cart = await Cart.create({ userId: req.user.id, items: [] });
  }

  successResponse(res, 200, 'Cart retrieved successfully', { cart });
});

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Fetch product details from Product Service
  const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';
  let productResponse;
  
  try {
    productResponse = await axios.get(`${productServiceUrl}/api/products/${productId}`);
  } catch (error) {
    return errorResponse(res, 404, 'Product not found');
  }

  const product = productResponse.data.data.product;

  // Check if product has enough stock
  if (product.quantity < quantity) {
    return errorResponse(res, 400, `Only ${product.quantity} items available in stock`);
  }

  // Find or create cart
  let cart = await Cart.findOne({ userId: req.user.id });
  
  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [] });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (product.quantity < newQuantity) {
      return errorResponse(res, 400, `Only ${product.quantity} items available in stock`);
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl
    });
  }

  await cart.save();

  successResponse(res, 200, 'Item added to cart', { cart });
});

/**
 * @route   PUT /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    return errorResponse(res, 404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return errorResponse(res, 404, 'Item not found in cart');
  }

  // Verify product stock
  const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';
  try {
    const productResponse = await axios.get(`${productServiceUrl}/api/products/${productId}`);
    const product = productResponse.data.data.product;

    if (product.quantity < quantity) {
      return errorResponse(res, 400, `Only ${product.quantity} items available in stock`);
    }
  } catch (error) {
    return errorResponse(res, 404, 'Product not found');
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  successResponse(res, 200, 'Cart updated successfully', { cart });
});

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    return errorResponse(res, 404, 'Cart not found');
  }

  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );

  await cart.save();

  successResponse(res, 200, 'Item removed from cart', { cart });
});

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear all items from cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    return errorResponse(res, 404, 'Cart not found');
  }

  cart.items = [];
  await cart.save();

  successResponse(res, 200, 'Cart cleared successfully', { cart });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
