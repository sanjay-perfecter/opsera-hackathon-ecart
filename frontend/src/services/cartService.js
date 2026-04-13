import api from './api';

const cartService = {
  // Get cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add to cart
  addToCart: async (productId, quantity) => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    const response = await api.put('/cart/update', { productId, quantity });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

export default cartService;
