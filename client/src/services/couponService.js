import { apiRequest } from './api';

export const couponService = {
  // Validate promo code against current order total
  validateCoupon: async (code, orderTotal) => {
    try {
      const response = await apiRequest('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, orderTotal })
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to apply coupon.');
    }
  },

  // Admin: Get all coupons
  getAllCoupons: async () => {
    try {
      const response = await apiRequest('/coupons');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch coupons.');
    }
  },

  // Admin: Create coupon
  createCoupon: async (couponData) => {
    try {
      const response = await apiRequest('/coupons', {
        method: 'POST',
        body: JSON.stringify(couponData)
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create coupon.');
    }
  },

  // Admin: Delete coupon
  deleteCoupon: async (id) => {
    try {
      const response = await apiRequest(`/coupons/${id}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete coupon.');
    }
  }
};
