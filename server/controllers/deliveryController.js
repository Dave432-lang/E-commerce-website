import { query } from '../config/db.js';

// @desc    Get all active regional delivery fees
// @route   GET /api/delivery/fees
// @access  Public
export const getDeliveryFees = async (req, res) => {
  try {
    const fees = await query(
      'SELECT id, region_name, fee, estimated_delivery FROM delivery_fees WHERE is_active = 1 ORDER BY region_name ASC'
    );
    res.json(fees);
  } catch (error) {
    console.error('Error fetching delivery fees:', error);
    res.status(500).json({ message: 'Server Error fetching delivery fees' });
  }
};

// @desc    Update a regional delivery fee (Admin only)
// @route   PUT /api/delivery/fees/:id
// @access  Private/Admin
export const updateDeliveryFee = async (req, res) => {
  const { id } = req.params;
  const { fee, estimated_delivery, is_active } = req.body;

  if (fee === undefined || isNaN(Number(fee)) || Number(fee) < 0) {
    return res.status(400).json({ message: 'Valid delivery fee amount is required' });
  }

  try {
    await query(
      'UPDATE delivery_fees SET fee = ?, estimated_delivery = COALESCE(?, estimated_delivery), is_active = COALESCE(?, is_active) WHERE id = ?',
      [Number(fee), estimated_delivery, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    res.json({ message: 'Delivery fee updated successfully' });
  } catch (error) {
    console.error('Error updating delivery fee:', error);
    res.status(500).json({ message: 'Server Error updating delivery fee' });
  }
};
