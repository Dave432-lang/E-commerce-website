import { apiRequest } from './api';

// Sample Fallback Boutique Products (Used when DB API is offline/unreachable)
export const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: 'Classic Leather Jacket',
    description: 'Timeless black genuine leather jacket crafted with premium silver hardware and a tailored slim fit.',
    price: 299.99,
    category: 'Outerwear',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown'],
    rating: 4.9,
    reviews_count: 38
  },
  {
    id: 2,
    name: 'Cashmere Ribbed Turtleneck',
    description: 'Ultra-soft 100% Mongolian cashmere knit sweater providing luxury warmth and a minimalist silhouette.',
    price: 189.50,
    category: 'Knitwear',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Beige', 'White', 'Black'],
    rating: 4.8,
    reviews_count: 24
  },
  {
    id: 3,
    name: 'Silk Wrap Evening Dress',
    description: 'Elegant mulberry silk midi dress featuring a graceful wrap silhouette, V-neckline, and fluid drape.',
    price: 245.00,
    category: 'Dresses',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    colors: ['Navy', 'Black', 'White'],
    rating: 4.9,
    reviews_count: 42
  },
  {
    id: 4,
    name: 'Tailored Wool Trench Coat',
    description: 'Double-breasted wool blend trench coat in warm camel shade with belt waist tie and notched lapels.',
    price: 349.99,
    category: 'Outerwear',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Olive', 'Black'],
    rating: 4.95,
    reviews_count: 51
  },
  {
    id: 5,
    name: 'Oversized Poplin Shirt',
    description: 'Crisp organic cotton poplin button-down shirt designed for relaxed modern styling.',
    price: 98.00,
    category: 'Shirts',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Navy', 'Beige'],
    rating: 4.7,
    reviews_count: 19
  },
  {
    id: 6,
    name: 'High-Waisted Pleated Trousers',
    description: 'Sophisticated wide-leg pleated trousers with smooth waist tailoring and subtle drape.',
    price: 135.00,
    category: 'Bottoms',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Beige', 'Navy'],
    rating: 4.85,
    reviews_count: 31
  },
  {
    id: 7,
    name: 'Minimalist Leather Tote Bag',
    description: 'Structured full-grain leather tote with spacious interior compartment and magnetic clasp closure.',
    price: 210.00,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Beige'],
    rating: 4.9,
    reviews_count: 67
  },
  {
    id: 8,
    name: 'Merino Wool Crewneck Sweater',
    description: 'Fine-gauge Australian merino wool sweater offering breathable insulation and subtle ribbing.',
    price: 140.00,
    category: 'Knitwear',
    image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Olive', 'White'],
    rating: 4.75,
    reviews_count: 28
  },
  {
    id: 9,
    name: 'Structured Blazer Dress',
    description: 'Double-breasted blazer dress with sharp shoulders, peak lapels, and custom gold crest buttons.',
    price: 285.00,
    category: 'Dresses',
    image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'White'],
    rating: 4.9,
    reviews_count: 45
  },
  {
    id: 10,
    name: 'Italian Leather Ankle Boots',
    description: 'Handcrafted Italian calfskin ankle boots featuring a sleek pointed toe and 65mm block heel.',
    price: 320.00,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    sizes: ['37', '38', '39', '40', '41'],
    colors: ['Black', 'Brown'],
    rating: 4.95,
    reviews_count: 58
  },
  {
    id: 11,
    name: 'Classic Vintage Denim Jacket',
    description: 'Heavyweight organic cotton denim jacket with authentic washed treatment and metal button closure.',
    price: 175.00,
    category: 'Outerwear',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black'],
    rating: 4.8,
    reviews_count: 33
  },
  {
    id: 12,
    name: 'Linen Summer Button-Down',
    description: 'Breathable 100% French linen shirt tailored for effortless resort wear and warm climates.',
    price: 110.00,
    category: 'Shirts',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Beige', 'Blue'],
    rating: 4.7,
    reviews_count: 22
  },
  {
    id: 13,
    name: 'Satin A-Line Midi Skirt',
    description: 'Luxurious bias-cut satin midi skirt featuring an elastic waistband and glossy fluid movement.',
    price: 125.00,
    category: 'Bottoms',
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Beige', 'Navy'],
    rating: 4.85,
    reviews_count: 41
  },
  {
    id: 14,
    name: 'Velvet Evening Tuxedo Blazer',
    description: 'Plush cotton velvet tuxedo jacket with satin shawl lapels and silk lining for gala evenings.',
    price: 410.00,
    category: 'Outerwear',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy'],
    rating: 5.0,
    reviews_count: 18
  },
  {
    id: 15,
    name: 'Ribbed Cotton Tank Top',
    description: 'Essential fitted tank top knit from stretch organic ribbed cotton with high neck styling.',
    price: 65.00,
    category: 'Tops',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['White', 'Black', 'Olive'],
    rating: 4.6,
    reviews_count: 14
  },
  {
    id: 16,
    name: 'Pleated Chiffon Maxi Dress',
    description: 'Floating sunray pleated chiffon gown with delicate spaghetti straps and cinched waistline.',
    price: 260.00,
    category: 'Dresses',
    image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    colors: ['Navy', 'White', 'Beige'],
    rating: 4.9,
    reviews_count: 29
  },
  {
    id: 17,
    name: 'Designer Leather Waist Belt',
    description: 'Polished calfskin belt with signature geometric brass buckle and hand-stitched edges.',
    price: 85.00,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Brown'],
    rating: 4.8,
    reviews_count: 36
  },
  {
    id: 18,
    name: 'Chunky Cable Knit Cardigan',
    description: 'Heavyweight hand-knit cardigan sweater featuring horn buttons and deep front patch pockets.',
    price: 195.00,
    category: 'Knitwear',
    image_url: 'https://images.unsplash.com/photo-1434389678369-18361fc474cc?w=800&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'White', 'Olive'],
    rating: 4.9,
    reviews_count: 47
  }
];

// Client-Side Filtering Helper for Fallback Data
const filterSampleProducts = ({ search = '', categories = [], colors = [], sizes = [], maxPrice = 500, sortBy = 'featured' }) => {
  let filtered = [...SAMPLE_PRODUCTS];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (categories.length > 0) {
    filtered = filtered.filter(p => categories.includes(p.category));
  }

  if (colors.length > 0) {
    filtered = filtered.filter(p => p.colors && p.colors.some(c => colors.includes(c)));
  }

  if (sizes.length > 0) {
    filtered = filtered.filter(p => p.sizes && p.sizes.some(s => sizes.includes(s)));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return filtered;
};

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const res = await apiRequest('/products');
      if (Array.isArray(res) && res.length > 0) return res;
      return SAMPLE_PRODUCTS;
    } catch (err) {
      console.warn('API error fetching all products, using fallback catalog:', err.message);
      return SAMPLE_PRODUCTS;
    }
  },

  // Get products with filters applied
  getFilteredProducts: async ({ search = '', categories = [], colors = [], sizes = [], maxPrice = 500, sortBy = 'featured' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categories.length > 0) params.set('category', categories.join(','));
      if (colors.length > 0) params.set('color', colors.join(','));
      if (sizes.length > 0) params.set('size', sizes.join(','));
      if (maxPrice && maxPrice < 500) params.set('maxPrice', maxPrice);
      if (sortBy && sortBy !== 'featured') params.set('sortBy', sortBy);

      const res = await apiRequest(`/products?${params.toString()}`);
      if (Array.isArray(res) && res.length > 0) return res;
      
      // If API returns 0 products due to DB state, fall back to sample dataset with filters
      return filterSampleProducts({ search, categories, colors, sizes, maxPrice, sortBy });
    } catch (err) {
      console.warn('API error fetching filtered products, using fallback catalog:', err.message);
      return filterSampleProducts({ search, categories, colors, sizes, maxPrice, sortBy });
    }
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      const res = await apiRequest(`/products/${id}`);
      if (res && res.id) return res;
      return SAMPLE_PRODUCTS.find(p => p.id === Number(id)) || SAMPLE_PRODUCTS[0];
    } catch (err) {
      console.warn('API error fetching product by ID, using fallback item:', err.message);
      return SAMPLE_PRODUCTS.find(p => p.id === Number(id)) || SAMPLE_PRODUCTS[0];
    }
  }
};


