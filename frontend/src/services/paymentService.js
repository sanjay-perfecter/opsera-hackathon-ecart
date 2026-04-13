import api from './api';

const paymentService = {
  // Create checkout session
  createCheckoutSession: async (orderId) => {
    const response = await api.post('/payments/create-checkout-session', { orderId });
    return response.data.data;
  },

  // Get session details
  getSessionDetails: async (sessionId) => {
    const response = await api.get(`/payments/session/${sessionId}`);
    return response.data.data;
  }
};

export default paymentService;
