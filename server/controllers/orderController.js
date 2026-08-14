import { pool, query } from '../config/db.js';
import { paymentService } from '../services/paymentService.js';
import { emailService } from '../services/emailService.js';

// @desc    Create a new order & verify Paystack payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentReference, paymentMethod } = req.body;

  if (!items || items.length === 0 || !totalAmount || !shippingAddress || !paymentReference) {
    return res.status(400).json({ message: 'Missing order details, shipping address, or payment reference' });
  }

  try {
    // Check if duplicate order exists (already processed via webhook)
    const existingOrder = await query('SELECT id FROM orders WHERE payment_reference = ?', [paymentReference]);
    if (existingOrder.length > 0) {
      console.log(`Order with payment reference ${paymentReference} already processed via webhook.`);
      return res.status(201).json({
        message: 'Order created successfully (webhook)',
        orderId: `BTQ-${existingOrder[0].id}`,
        total: totalAmount
      });
    }

    // 1. Verify payment with Paystack
    const paystackData = await paymentService.verifyTransaction(paymentReference);

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ message: 'Paystack payment verification failed' });
    }

    // Verify paid amount matches (Paystack amount is in minor units: kobo/pesewas, i.e. cents)
    const paidAmount = paystackData.data.amount / 100;
    
    // Check if the difference is larger than 0.05
    if (Math.abs(paidAmount - totalAmount) > 0.05) {
      return res.status(400).json({ message: `Payment amount mismatch. Expected: ${totalAmount}, Paid: ${paidAmount}` });
    }

    // 2. Insert order and items using a single transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Stock Availability Verification
      for (const item of items) {
        const [prodRows] = await conn.execute(
          'SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE',
          [item.id]
        );
        if (prodRows && prodRows.length > 0) {
          const currentStock = prodRows[0].stock_quantity;
          if (currentStock < item.quantity) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({
              message: `Insufficient stock for "${prodRows[0].name}". Available stock: ${currentStock}`
            });
          }
        }
      }

      // Insert into orders table including payment_reference
      const [orderResult] = await conn.execute(
        'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, totalAmount, 'Processing', shippingAddress, paymentMethod || 'Paystack (Card/Momo)', paymentReference]
      );
      
      const orderId = orderResult.insertId;

      // Insert into order_items table and decrement stock atomically for each item
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

      // Trigger order confirmation email asynchronously
      emailService.sendOrderConfirmationEmail(req.user.email, req.user.name, {
        id: orderId,
        total_price: totalAmount,
        items,
        shipping_address: shippingAddress,
        payment_method: paymentMethod || 'Paystack (Card/Momo)'
      });

      res.status(201).json({
        message: 'Order created successfully',
        orderId: `BTQ-${orderId}`,
        total: totalAmount
      });
    } catch (transactionError) {
      await conn.rollback();
      conn.release();
      throw transactionError;
    }
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Server Error creating order' });
  }
};

// @desc    Get current user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const fullOrders = [];
    for (const order of orders) {
      // Fetch details of all items in this order
      const items = await query(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      fullOrders.push({
        id: `BTQ-${order.id}`,
        date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: items.map(item => ({
          id: item.product_id,
          name: item.name,
          image: item.image_url,
          quantity: item.quantity,
          size: item.selected_size,
          color: item.selected_color,
          price: Number(item.price_at_time)
        })),
        total: Number(order.total_amount),
        status: order.status,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method
      });
    }

    res.json(fullOrders);
  } catch (error) {
    console.error('Fetch My Orders Error:', error);
    res.status(500).json({ message: 'Server Error fetching orders' });
  }
};
