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
    const minOrder = Number(coupon.min_order_value) || 0;

    if (total < minOrder) {
      return res.status(400).json({
        message: `This coupon requires a minimum order total of GH₵${minOrder.toFixed(2)}`
      });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ message: 'This coupon code has expired' });
    }

    if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ message: 'This coupon code usage limit has been reached' });
    }

    const discountVal = Number(coupon.discount_value);
    let discountAmount = 0;

    if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(total, discountVal);
    } else {
      discountAmount = Number(((total * discountVal) / 100).toFixed(2));
    }

    const newTotal = Number(Math.max(0, total - discountAmount).toFixed(2));

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: discountVal,
      discountAmount,
      newTotal,
      message: `Coupon '${coupon.code}' applied! You saved ${coupon.discount_type === 'fixed' ? 'GH₵' + discountVal.toFixed(2) : discountVal + '%'}.`
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
      discountType: c.discount_type || 'percentage',
      discountValue: Number(c.discount_value || c.discount_percent || 10),
      minOrderValue: Number(c.min_order_value || 0),
      usageLimit: c.usage_limit,
      timesUsed: c.times_used || 0,
      expiresAt: c.expires_at,
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
  const { code, discountType, discountValue, minOrderValue, usageLimit, expiresAt } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ message: 'Coupon code and discount value are required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const val = Number(discountValue);
  const minOrder = minOrderValue !== undefined ? Number(minOrderValue) : 0;
  const type = discountType === 'fixed' ? 'fixed' : 'percentage';

  if (val <= 0) {
    return res.status(400).json({ message: 'Discount value must be greater than 0' });
  }

  try {
    const existing = await query('SELECT id FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(400).json({ message: `Coupon '${cleanCode}' already exists` });
    }

    const result = await query(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [cleanCode, type, val, minOrder, usageLimit || null, expiresAt || null]
    );

    res.status(201).json({
      message: `Coupon '${cleanCode}' created successfully`,
      id: result.insertId,
      code: cleanCode,
      discountType: type,
      discountValue: val,
      minOrderValue: minOrder
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
