import api from './api';

const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product (admin)
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update product (admin)
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete product (admin)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Restore product (admin)
  restoreProduct: async (id) => {
    const response = await api.patch(`/products/${id}/restore`);
    return response.data;
  },

  // Get product stats (admin)
  getProductStats: async () => {
    const response = await api.get('/products/stats/overview');
    return response.data;
  },

  // Get all categories (public)
  getCategories: async (params = {}) => {
    const response = await api.get('/products/categories', { params });
    return response.data;
  },

  // Create category (admin)
  createCategory: async (categoryData) => {
    const response = await api.post('/products/categories', categoryData);
    return response.data;
  },

  // Update category (admin)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/products/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`/products/categories/${id}`);
    return response.data;
  },

  // Restore category (admin)
  restoreCategory: async (id) => {
    const response = await api.patch(`/products/categories/${id}/restore`);
    return response.data;
  }
};

export default productService;
