import { query } from '../config/db.js';

// Helper to clean and parse JSON array strings from MySQL
const parseProductArrays = (product) => {
  if (!product) return null;
  return {
    ...product,
    price: Number(product.price), // Convert string decimal from MySQL to standard JS number to prevent crashes like .toFixed() is not a function!
    image: product.image_url, // Map database image_url to image for frontend component compatibility
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []),
    colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : (product.colors || [])
  };
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const rows = await query('SELECT * FROM products ORDER BY created_at DESC');
    const parsedProducts = rows.map(parseProductArrays);
    res.json(parsedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(parseProductArrays(rows[0]));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
