import { query } from '../config/db.js';

// @desc    Validate a promo code / coupon
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  const { code, orderTotal } = req.body;

  if (!code || code.trim() === '') {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    const cleanCode = code.trim().toUpperCase();
    const rows = await query(
      'SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1',
      [cleanCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    const coupon = rows[0];
    const total = Number(orderTotal) || 0;
    const minOrder = Number(coupon.min_order_amount) || 0;

    if (total < minOrder) {
      return res.status(400).json({
        message: `This coupon requires a minimum order total of $${minOrder.toFixed(2)}`
      });
    }

    const discountPercent = Number(coupon.discount_percent);
    const discountAmount = Number(((total * discountPercent) / 100).toFixed(2));
    const newTotal = Number((total - discountAmount).toFixed(2));

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent,
      discountAmount,
      newTotal,
      message: `Coupon '${coupon.code}' applied! You saved ${discountPercent}%.`
    });
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({ message: 'Server Error validating coupon' });
  }
};

// @desc    Get all promo coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(coupons.map(c => ({
      id: c.id,
      code: c.code,
      discountPercent: Number(c.discount_percent),
      minOrderAmount: Number(c.min_order_amount),
      isActive: Boolean(c.is_active),
      createdAt: c.created_at
    })));
  } catch (error) {
    console.error('Get All Coupons Error:', error);
    res.status(500).json({ message: 'Server Error fetching coupons' });
  }
};

// @desc    Create a new promo coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountPercent, minOrderAmount } = req.body;

  if (!code || !discountPercent) {
    return res.status(400).json({ message: 'Coupon code and discount percentage are required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const percent = Number(discountPercent);
  const minOrder = minOrderAmount !== undefined ? Number(minOrderAmount) : 0;

  if (percent < 1 || percent > 100) {
    return res.status(400).json({ message: 'Discount percent must be between 1 and 100' });
  }

  try {
    const existing = await query('SELECT id FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(400).json({ message: `Coupon '${cleanCode}' already exists` });
    }

    const result = await query(
      'INSERT INTO coupons (code, discount_percent, min_order_amount) VALUES (?, ?, ?)',
      [cleanCode, percent, minOrder]
    );

    res.status(201).json({
      message: `Coupon '${cleanCode}' created successfully`,
      id: result.insertId,
      code: cleanCode,
      discountPercent: percent,
      minOrderAmount: minOrder
    });
  } catch (error) {
    console.error('Create Coupon Error:', error);
    res.status(500).json({ message: 'Server Error creating coupon' });
  }
};

// @desc    Toggle coupon status or delete
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM coupons WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully', id });
  } catch (error) {
    console.error('Delete Coupon Error:', error);
    res.status(500).json({ message: 'Server Error deleting coupon' });
  }
};
