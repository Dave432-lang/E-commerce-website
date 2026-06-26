import { query } from '../config/db.js';

// @desc    Get all wishlist items for logged in user
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await query(
      `SELECT w.id, w.product_id, p.name, p.price, p.image_url, p.category, p.rating, p.sizes, p.colors
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    const formatted = items.map(item => ({
      id: item.product_id,
      wishlistId: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.image_url,
      category: item.category,
      rating: Number(item.rating),
      sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes) : (item.sizes || []),
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : (item.colors || [])
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    res.status(500).json({ message: 'Server Error fetching wishlist' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    await query(
      `INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)`,
      [userId, productId]
    );

    res.status(201).json({ message: 'Product added to wishlist', productId });
  } catch (error) {
    console.error('Add to Wishlist Error:', error);
    res.status(500).json({ message: 'Server Error adding to wishlist' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    await query(
      `DELETE FROM wishlists WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    res.json({ message: 'Product removed from wishlist', productId });
  } catch (error) {
    console.error('Remove from Wishlist Error:', error);
    res.status(500).json({ message: 'Server Error removing from wishlist' });
  }
};
