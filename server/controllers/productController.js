import { query } from '../config/db.js';

// Helper to clean and parse JSON array strings from MySQL
const parseProductArrays = (product) => {
  if (!product) return null;
  return {
    ...product,
    price: Number(product.price),
    rating: Number(product.rating || 0),
    stock_quantity: Number(product.stock_quantity ?? 50),
    is_archived: Boolean(product.is_archived),
    image: product.image_url,
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []),
    colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : (product.colors || [])
  };
};

// @desc    Fetch products with optional server-side filtering
// @route   GET /api/products?search=&category=&color=&size=&maxPrice=&sortBy=&includeArchived=
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, category, color, size, maxPrice, sortBy, includeArchived } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    // Hide archived products unless explicitly requested (e.g., by admin panel)
    if (includeArchived !== 'true') {
      sql += ' AND (is_archived = 0 OR is_archived IS NULL)';
    }
    const params = [];

    // Full-text search on name and description
    if (search && search.trim() !== '') {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category && category.trim() !== '') {
      const cats = category.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length > 0) {
        sql += ` AND category IN (${cats.map(() => '?').join(',')})`;
        params.push(...cats);
      }
    }

    // JSON-based color filter (MySQL JSON_CONTAINS)
    if (color && color.trim() !== '') {
      const cols = color.split(',').map(c => c.trim()).filter(Boolean);
      if (cols.length > 0) {
        const colorClauses = cols.map(() => 'JSON_CONTAINS(colors, ?)').join(' OR ');
        sql += ` AND (${colorClauses})`;
        cols.forEach(c => params.push(JSON.stringify(c)));
      }
    }

    // JSON-based size filter (MySQL JSON_CONTAINS)
    if (size && size.trim() !== '') {
      const sizes = size.split(',').map(s => s.trim()).filter(Boolean);
      if (sizes.length > 0) {
        const sizeClauses = sizes.map(() => 'JSON_CONTAINS(sizes, ?)').join(' OR ');
        sql += ` AND (${sizeClauses})`;
        sizes.forEach(s => params.push(JSON.stringify(s)));
      }
    }

    // Max price filter
    if (maxPrice && !isNaN(Number(maxPrice))) {
      sql += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':  sql += ' ORDER BY price ASC'; break;
      case 'price-high': sql += ' ORDER BY price DESC'; break;
      case 'rating':     sql += ' ORDER BY rating DESC'; break;
      default:           sql += ' ORDER BY created_at DESC'; break;
    }

    const rows = await query(sql, params);
    res.json(rows.map(parseProductArrays));
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
