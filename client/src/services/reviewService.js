import { apiRequest } from './api';

export const reviewService = {
  // Fetch reviews for a specific product
  getProductReviews: async (productId) => {
    try {
      const reviews = await apiRequest(`/reviews/product/${productId}`);
      return reviews || [];
    } catch (err) {
      console.warn('API error fetching reviews, returning empty list:', err.message);
      return [];
    }
  },

  // Submit a review for a product
  submitReview: async (productId, rating, comment) => {
    return await apiRequest(`/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }
};
