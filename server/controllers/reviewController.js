import { query } from '../config/db.js';

// @desc    Get all reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const formattedReviews = reviews.map(r => ({
      id: r.id,
      rating: Number(r.rating),
      comment: r.comment,
      userName: r.user_name,
      date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    res.status(500).json({ message: 'Server Error fetching product reviews' });
  }
};

// @desc    Add a review to a product
// @route   POST /api/reviews/product/:productId
// @access  Private
export const addReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || !comment || comment.trim() === '') {
    return res.status(400).json({ message: 'Rating and comment are required' });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // 1. Check if user has already reviewed this product
    const existing = await query('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // 2. Insert new review
    await query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, productId, numRating, comment.trim()]
    );

    // 3. Recalculate average rating for the product and update products table
    const ratingRows = await query(
      'SELECT AVG(rating) as avgRating FROM reviews WHERE product_id = ?',
      [productId]
    );
    const avgRating = ratingRows[0].avgRating ? Number(ratingRows[0].avgRating).toFixed(1) : numRating;

    await query('UPDATE products SET rating = ? WHERE id = ?', [avgRating, productId]);

    res.status(201).json({
      message: 'Review submitted successfully',
      rating: numRating,
      newProductRating: Number(avgRating)
    });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ message: 'Server Error submitting review' });
  }
};
