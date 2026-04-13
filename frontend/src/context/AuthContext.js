import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { setSecureItem, getSecureItem, removeSecureItem } from '../utils/helpers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = getSecureItem('user');
    const tokens = getSecureItem('tokens');
    
    if (savedUser && tokens) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      const { user, accessToken, refreshToken } = response.data;
      
      // Save user and tokens
      setSecureItem('user', user);
      setSecureItem('tokens', { accessToken, refreshToken });
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const signin = async (credentials) => {
    try {
      const response = await authService.signin(credentials);
      const { user, accessToken, refreshToken } = response.data;
      
      // Save user and tokens
      setSecureItem('user', user);
      setSecureItem('tokens', { accessToken, refreshToken });
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signin failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      removeSecureItem('user');
      removeSecureItem('tokens');
      setUser(null);
    }
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    user,
    loading,
    signup,
    signin,
    logout,
    isAdmin,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
