import api from './api';

const authService = {
  // Signup
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Signin
  signin: async (credentials) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Verify token
  verifyToken: async () => {
    const response = await api.post('/auth/verify');
    return response.data;
  }
};

export default authService;
