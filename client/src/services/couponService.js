import api from './api';

export const couponService = {
  // Validate promo code against current order total
  validateCoupon: async (code, orderTotal) => {
    try {
      const response = await api.post('/coupons/validate', { code, orderTotal });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply coupon.');
    }
  },

  // Admin: Get all coupons
  getAllCoupons: async () => {
    try {
      const response = await api.get('/coupons');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupons.');
    }
  },

  // Admin: Create coupon
  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create coupon.');
    }
  },

  // Admin: Delete coupon
  deleteCoupon: async (id) => {
    try {
      const response = await api.delete(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete coupon.');
    }
  }
};
