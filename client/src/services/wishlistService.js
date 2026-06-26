import { apiRequest } from './api';

export const wishlistService = {
  // Get all wishlist items for the logged in user
  getWishlist: async () => {
    return await apiRequest('/wishlist');
  },

  // Add a product to wishlist
  addToWishlist: async (productId) => {
    return await apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  // Remove a product from wishlist
  removeFromWishlist: async (productId) => {
    return await apiRequest(`/wishlist/${productId}`, {
      method: 'DELETE'
    });
  }
};
