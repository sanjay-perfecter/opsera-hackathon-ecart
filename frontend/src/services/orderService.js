import api from './api';

const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Get all orders (admin)
  getAllOrders: async (params = {}) => {
    const response = await api.get('/orders/all/list', { params });
    return response.data;
  },

  // Update order status (admin)
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Get order stats (admin)
  getOrderStats: async () => {
    const response = await api.get('/orders/stats/overview');
    return response.data;
  }
};

export default orderService;
