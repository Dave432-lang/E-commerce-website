import { apiRequest } from './api';

export const cartService = {
  // Get all cart items for logged-in user
  getCartItems: async () => {
    return await apiRequest('/cart');
  },

  // Add item to cart
  addToCart: async (productId, quantity, size, color) => {
    return await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size, color })
    });
  },

  // Update item quantity
  updateCartItem: async (productId, quantity, size, color) => {
    return await apiRequest('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity, size, color })
    });
  },

  // Remove item from database cart
  removeFromCart: async (productId, size, color) => {
    return await apiRequest('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ productId, size, color })
    });
  },

  // Sync guest cart with database cart upon login
  syncCart: async (items) => {
    try {
      return await apiRequest('/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ items })
      });
    } catch (err) {
      console.warn('Sync cart handled locally:', err.message);
      return { message: 'Local cart retained' };
    }
  }
};
