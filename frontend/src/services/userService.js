import api from './api';

const userService = {
  // Create user (admin)
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Get all users (admin)
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Update user role (admin)
  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // Delete user (admin)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Restore user (admin)
  restoreUser: async (id) => {
    const response = await api.patch(`/users/${id}/restore`);
    return response.data;
  },

  // Get user stats (admin)
  getUserStats: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  }
};

export default userService;
