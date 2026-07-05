import { apiRequest } from './api';

export const productService = {
  // Get all products (no filters)
  getAllProducts: async () => {
    return await apiRequest('/products');
  },

  // Get products with server-side filters applied
  getFilteredProducts: async ({ search = '', categories = [], colors = [], sizes = [], maxPrice = 500, sortBy = 'featured' } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categories.length > 0) params.set('category', categories.join(','));
    if (colors.length > 0) params.set('color', colors.join(','));
    if (sizes.length > 0) params.set('size', sizes.join(','));
    if (maxPrice && maxPrice < 500) params.set('maxPrice', maxPrice);
    if (sortBy && sortBy !== 'featured') params.set('sortBy', sortBy);
    return await apiRequest(`/products?${params.toString()}`);
  },

  // Get a single product by ID
  getProductById: async (id) => {
    return await apiRequest(`/products/${id}`);
  }
};

