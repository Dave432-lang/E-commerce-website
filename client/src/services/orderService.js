import { apiRequest } from './api';

export const orderService = {
  // Create a new order with Paystack verification reference
  createOrder: async (orderData) => {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Get logged-in user's order history
  getMyOrders: async () => {
    return await apiRequest('/orders/my-orders');
  },

  // Fetch active regional delivery fees
  getDeliveryFees: async () => {
    return await apiRequest('/delivery/fees');
  },

  // Track order by Order ID (Public)
  trackOrder: async (orderId) => {
    return await apiRequest(`/orders/track/${encodeURIComponent(orderId)}`);
  }
};

