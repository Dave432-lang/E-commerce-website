import { apiRequest } from './api';

export const adminService = {
  // Dashboard stats
  getStats: async () => await apiRequest('/admin/stats'),
  // Orders
  getAllOrders: async () => await apiRequest('/admin/orders'),
  updateOrderStatus: async (orderId, status) => await apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  // Products CRUD
  getAllProducts: async () => await apiRequest('/admin/products'),
  addProduct: async (product) => await apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: async (id, product) => await apiRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: async (id) => await apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  // Users
  getAllUsers: async () => await apiRequest('/admin/users')
};
