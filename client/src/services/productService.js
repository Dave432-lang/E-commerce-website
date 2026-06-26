import { apiRequest } from './api';

export const productService = {
  // Get all products
  getAllProducts: async () => {
    return await apiRequest('/products');
  },

  // Get a single product by ID
  getProductById: async (id) => {
    return await apiRequest(`/products/${id}`);
  }
};
