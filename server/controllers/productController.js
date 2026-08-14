import { query } from '../config/db.js';

// Helper to clean and parse JSON array strings from MySQL
const parseProductArrays = (product) => {
  if (!product) return null;
  const regularPrice = Number(product.price);
  const salePrice = product.sale_price !== null && product.sale_price !== undefined ? Number(product.sale_price) : null;
  const isOnSale = salePrice !== null && salePrice > 0 && salePrice < regularPrice;

  return {
    ...product,
    price: regularPrice,
    sale_price: salePrice,
    effective_price: isOnSale ? salePrice : regularPrice,
    is_on_sale: isOnSale,
    gender: product.gender || 'unisex',
    is_featured: Boolean(product.is_featured),
    is_new_arrival: Boolean(product.is_new_arrival),
    rating: Number(product.rating || 0),
    stock_quantity: Number(product.stock_quantity ?? 50),
    is_archived: Boolean(product.is_archived),
    image: product.image_url,
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []),
    colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : (product.colors || [])
  };
};

// @desc    Fetch products with optional server-side filtering
// @route   GET /api/products?gender=&category=&color=&size=&minPrice=&maxPrice=&onSale=&isNewArrival=&isFeatured=&inStockOnly=&sortBy=&includeArchived=
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      gender,
      category,
      color,
      size,
      minPrice,
      maxPrice,
      onSale,
      isNewArrival,
      isFeatured,
      inStockOnly,
      sortBy,
      includeArchived
    } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    if (includeArchived !== 'true') {
      sql += ' AND (is_archived = 0 OR is_archived IS NULL)';
    }
    const params = [];

    // Full-text search on name, description, category
    if (search && search.trim() !== '') {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Gender filter (women, men, unisex)
    if (gender && gender.trim() !== '') {
      const g = gender.trim().toLowerCase();
      if (g === 'women') {
        sql += " AND (gender = 'women' OR gender = 'unisex' OR gender IS NULL)";
      } else if (g === 'men') {
        sql += " AND (gender = 'men' OR gender = 'unisex' OR gender IS NULL)";
      } else if (g === 'unisex') {
        sql += " AND (gender = 'unisex' OR gender IS NULL)";
      }
    }

    // Category filter
    if (category && category.trim() !== '') {
      const cats = category.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length > 0) {
        sql += ` AND category IN (${cats.map(() => '?').join(',')})`;
        params.push(...cats);
      }
    }

    // JSON-based color filter
    if (color && color.trim() !== '') {
      const cols = color.split(',').map(c => c.trim()).filter(Boolean);
      if (cols.length > 0) {
        const colorClauses = cols.map(() => 'JSON_CONTAINS(colors, ?)').join(' OR ');
        sql += ` AND (${colorClauses})`;
        cols.forEach(c => params.push(JSON.stringify(c)));
      }
    }

    // JSON-based size filter
    if (size && size.trim() !== '') {
      const sizes = size.split(',').map(s => s.trim()).filter(Boolean);
      if (sizes.length > 0) {
        const sizeClauses = sizes.map(() => 'JSON_CONTAINS(sizes, ?)').join(' OR ');
        sql += ` AND (${sizeClauses})`;
        sizes.forEach(s => params.push(JSON.stringify(s)));
      }
    }

    // Min and Max price filters
    if (minPrice && !isNaN(Number(minPrice))) {
      sql += ' AND price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      sql += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    // On Sale filter
    if (onSale === 'true') {
      sql += ' AND (sale_price IS NOT NULL AND sale_price > 0 AND sale_price < price)';
    }

    // New arrival filter
    if (isNewArrival === 'true') {
      sql += ' AND is_new_arrival = 1';
    }

    // Featured filter
    if (isFeatured === 'true') {
      sql += ' AND is_featured = 1';
    }

    // In stock filter
    if (inStockOnly === 'true') {
      sql += ' AND stock_quantity > 0';
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':  sql += ' ORDER BY COALESCE(sale_price, price) ASC'; break;
      case 'price-high': sql += ' ORDER BY COALESCE(sale_price, price) DESC'; break;
      case 'rating':     sql += ' ORDER BY rating DESC'; break;
      case 'newest':     sql += ' ORDER BY created_at DESC'; break;
      default:           sql += ' ORDER BY is_featured DESC, created_at DESC'; break;
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
