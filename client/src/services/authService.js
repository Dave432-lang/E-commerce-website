import { apiRequest } from './api';

export const authService = {
  // Register a new user
  register: async (name, email, password) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  // Login user
  login: async (email, password) => {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },

  // Update user profile (optionally including password change)
  updateProfile: async (name, email, currentPassword = null, newPassword = null) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email, currentPassword, newPassword })
    });
  },

  // Request password reset token
  forgotPassword: async (email) => {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Submit new password with reset token
  resetPassword: async (token, newPassword) => {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }
};

