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
  }
};
