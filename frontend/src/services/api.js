import axios from 'axios';
import API_URL from '../config/api';
import { getSecureItem, setSecureItem, removeSecureItem } from '../utils/helpers';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const tokens = getSecureItem('tokens');
    if (tokens && tokens.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokens = getSecureItem('tokens');
      if (tokens && tokens.refreshToken) {
        try {
          // Try to refresh token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken
          });

          const { accessToken } = response.data.data;

          // Update tokens
          setSecureItem('tokens', {
            accessToken,
            refreshToken: tokens.refreshToken
          });

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          removeSecureItem('tokens');
          removeSecureItem('user');
          window.location.href = '/signin';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
