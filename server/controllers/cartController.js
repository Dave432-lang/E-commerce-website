import { query } from '../config/db.js';

// @desc    Get logged in user's cart items
// @route   GET /api/cart
// @access  Private
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await query(
      `SELECT c.id, c.product_id, c.quantity, c.selected_size, c.selected_color, 
              p.name, p.price, p.image_url, p.category
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC`,
      [userId]
    );

    // Map database properties to match client component conventions
    const formattedItems = items.map(item => ({
      id: item.product_id, // Map product_id to id so frontend doesn't break
      cartItemId: item.id, // Keep reference to cart row
      name: item.name,
      price: Number(item.price),
      image: item.image_url,
      category: item.category,
      quantity: item.quantity,
      size: item.selected_size,
      color: item.selected_color
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Get Cart Items Error:', error);
    res.status(500).json({ message: 'Server Error retrieving cart items' });
  }
};

// @desc    Add or update item in cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity, size, color } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const selectedSize = size || 'M';
  const selectedColor = color || 'Default';
  const qty = Number(quantity) || 1;

  try {
    // Insert item. If already exists, increment its quantity!
    await query(
      `INSERT INTO cart_items (user_id, product_id, quantity, selected_size, selected_color)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, productId, qty, selectedSize, selectedColor]
    );

    res.status(200).json({ message: 'Item added/updated in database cart' });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.status(500).json({ message: 'Server Error saving cart item' });
  }
};

// @desc    Update cart item quantity or details
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = async (req, res) => {
  const { productId, size, color, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ message: 'Product ID and new quantity are required' });
  }

  const selectedSize = size || 'M';
  const selectedColor = color || 'Default';
  const newQty = Number(quantity);

  if (newQty < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    await query(
      `UPDATE cart_items 
       SET quantity = ? 
       WHERE user_id = ? AND product_id = ? AND selected_size = ? AND selected_color = ?`,
      [newQty, userId, productId, selectedSize, selectedColor]
    );

    res.status(200).json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update Cart Item Error:', error);
    res.status(500).json({ message: 'Server Error updating cart item' });
  }
};

// @desc    Remove item from database cart
// @route   DELETE /api/cart
// @access  Private
export const removeFromCart = async (req, res) => {
  const { productId, size, color } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const selectedSize = size || 'M';
  const selectedColor = color || 'Default';

  try {
    await query(
      `DELETE FROM cart_items 
       WHERE user_id = ? AND product_id = ? AND selected_size = ? AND selected_color = ?`,
      [userId, productId, selectedSize, selectedColor]
    );

    res.status(200).json({ message: 'Item removed from database cart' });
  } catch (error) {
    console.error('Remove From Cart Error:', error);
    res.status(500).json({ message: 'Server Error removing cart item' });
  }
};

// @desc    Sync local cart items with database upon login
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Items array is required' });
  }

  try {
    for (const item of items) {
      const productId = item.id;
      const quantity = Number(item.quantity) || 1;
      const size = item.size || 'M';
      const color = item.color || 'Default';

      await query(
        `INSERT INTO cart_items (user_id, product_id, quantity, selected_size, selected_color)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [userId, productId, quantity, size, color]
      );
    }

    res.status(200).json({ message: 'Cart synced successfully' });
  } catch (error) {
    console.error('Sync Cart Error:', error);
    res.status(500).json({ message: 'Server Error syncing cart' });
  }
};
