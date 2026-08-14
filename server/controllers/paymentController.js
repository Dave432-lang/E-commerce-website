import { pool, query } from '../config/db.js';
import { paymentService } from '../services/paymentService.js';

// @desc    Handle Paystack Webhook events
// @route   POST /api/payments/webhook
// @access  Public
export const handlePaystackWebhook = async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  
  // 1. Verify signatures to authenticate Paystack origin
  const isValid = paymentService.verifySignature(req.rawBody, signature);
  if (!isValid) {
    console.error('Paystack webhook signature verification failed.');
    return res.status(401).json({ message: 'Invalid webhook signature' });
  }

  const event = req.body;
  
  // 2. We only care about charge.success
  if (event.event === 'charge.success') {
    const paymentData = event.data;
    const reference = paymentData.reference;
    const totalAmount = paymentData.amount / 100; // Paystack minor GHS pesewas to decimal
    const paymentMethod = paymentData.channel === 'card' ? 'Paystack Card' : 'Paystack Momo';
    
    console.log(`Processing successful payment webhook for reference: ${reference}`);

    try {
      // 3. Prevent duplicate order creations
      const existingOrder = await query('SELECT id FROM orders WHERE payment_reference = ?', [reference]);
      if (existingOrder.length > 0) {
        console.log(`Order with payment reference ${reference} already exists in database. Skipping.`);
        return res.status(200).json({ message: 'Order already exists' });
      }

      // 4. Retrieve metadata parameters
      const metadata = paymentData.metadata;
      if (!metadata || !metadata.userId || !metadata.items || metadata.items.length === 0) {
        console.warn('Paystack webhook payload missing crucial metadata. Cannot recover order automatically.');
        return res.status(200).json({ message: 'Missing metadata, order not auto-recovered' });
      }

      const { userId, shippingAddress, items } = metadata;

      // 5. Begin transaction and write order
      const conn = await pool.getConnection();
      await conn.beginTransaction();

      try {
        const [orderResult] = await conn.execute(
          'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, totalAmount, 'Processing', shippingAddress || 'Ghana', paymentMethod, reference]
        );

        const orderId = orderResult.insertId;

        for (const item of items) {
          await conn.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, selected_size, selected_color, price_at_time) VALUES (?, ?, ?, ?, ?, ?)',
            [orderId, item.id, item.quantity, item.size || 'M', item.color || 'Default', item.price]
          );

          await conn.execute(
            'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
            [item.quantity, item.id]
          );
        }

        await conn.commit();
        conn.release();
        console.log(`Successfully recovered order BTQ-${orderId} from webhook event.`);
      } catch (transactionError) {
        await conn.rollback();
        conn.release();

        if (transactionError.code === 'ER_DUP_ENTRY' || transactionError.errno === 1062) {
          console.log(`Webhook order for reference ${reference} already created concurrently. Returning success.`);
          return res.status(200).json({ status: 'success', message: 'Order already processed' });
        }
        throw transactionError;
      }
    } catch (dbError) {
      console.error('Webhook database operation failed:', dbError);
      return res.status(500).json({ message: 'Database order creation failed via webhook' });
    }
  }

  // Always return 200 OK so Paystack doesn't re-deliver
  res.status(200).json({ status: 'success' });
};
