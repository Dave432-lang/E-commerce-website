import { pool, query } from '../config/db.js';
import { paymentService } from '../services/paymentService.js';
import { emailService } from '../services/emailService.js';

// @desc    Create a new order & verify Paystack payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { items, couponCode, shippingAddress, paymentReference, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress || !paymentReference) {
    return res.status(400).json({ message: 'Missing order items, shipping address, or payment reference' });
  }

  try {
    // 1. Check if order with this payment_reference already exists (Idempotency Pre-Check)
    const existingOrder = await query('SELECT id, total_amount FROM orders WHERE payment_reference = ?', [paymentReference]);
    if (existingOrder.length > 0) {
      console.log(`Order with payment reference ${paymentReference} already exists. Returning existing order.`);
      return res.status(200).json({
        message: 'Order already processed',
        orderId: `BTQ-${existingOrder[0].id}`,
        total: Number(existingOrder[0].total_amount)
      });
    }

    // 2. Authoritative Server-Side Price & Quantity Validation
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const productId = Number(item.id);
      const qty = Number(item.quantity);

      if (!productId || isNaN(productId) || !qty || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        return res.status(400).json({ message: 'Invalid product item or quantity in order request' });
      }

      // Query real price and stock from database
      const prodRows = await query(
        'SELECT id, name, price, stock_quantity, is_archived FROM products WHERE id = ?',
        [productId]
      );

      if (!prodRows || prodRows.length === 0 || prodRows[0].is_archived) {
        return res.status(400).json({ message: `Product #${productId} is currently unavailable` });
      }

      const dbProduct = prodRows[0];
      const dbPrice = Number(dbProduct.price);
      const lineTotal = dbPrice * qty;
      calculatedTotal += lineTotal;

      verifiedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbPrice, // Strict DB price
        quantity: qty,
        size: item.size || 'M',
        color: item.color || 'Default'
      });
    }

    // 3. Apply Coupon Code Discount Server-Side if Provided
    if (couponCode) {
      const couponRows = await query(
        'SELECT discount_percent, min_order_amount FROM coupons WHERE code = ? AND is_active = 1',
        [couponCode]
      );
      if (couponRows && couponRows.length > 0) {
        const coupon = couponRows[0];
        if (calculatedTotal >= Number(coupon.min_order_amount)) {
          const discount = (calculatedTotal * Number(coupon.discount_percent)) / 100;
          calculatedTotal -= discount;
        }
      }
    }

    calculatedTotal = Math.round(calculatedTotal * 100) / 100;

    // 4. Verify Payment with Paystack REST API
    const paystackData = await paymentService.verifyTransaction(paymentReference);

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ message: 'Paystack payment verification failed' });
    }

    // Convert Paystack minor units (pesewas/cents) to main decimal currency
    const paidAmount = paystackData.data.amount / 100;

    // Validate paid amount strictly against server-calculated DB total
    if (Math.abs(paidAmount - calculatedTotal) > 0.05) {
      console.error(`PRICE MANIPULATION DETECTED! Paid: ${paidAmount}, Server Calculated Required: ${calculatedTotal}`);
      return res.status(400).json({
        message: `Payment verification error: Paid amount (GH₵${paidAmount.toFixed(2)}) does not match required order total (GH₵${calculatedTotal.toFixed(2)})`
      });
    }

    // 5. Database Order Write & Stock Decrement Transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Stock Verification with FOR UPDATE Lock
      for (const item of verifiedItems) {
        const [stockCheck] = await conn.execute(
          'SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE',
          [item.id]
        );
        if (stockCheck && stockCheck.length > 0) {
          const availableStock = stockCheck[0].stock_quantity;
          if (availableStock < item.quantity) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({
              message: `Insufficient stock for "${stockCheck[0].name}". Available: ${availableStock}`
            });
          }
        }
      }

      // Insert Order
      const [orderResult] = await conn.execute(
        'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, calculatedTotal, 'Processing', shippingAddress, paymentMethod || 'Paystack (Card/Momo)', paymentReference]
      );

      const orderId = orderResult.insertId;

      // Insert Order Items and Decrement Stock
      for (const item of verifiedItems) {
        await conn.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, selected_size, selected_color, price_at_time) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.id, item.quantity, item.size, item.color, item.price]
        );

        await conn.execute(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
          [item.quantity, item.id]
        );
      }

      await conn.commit();
      conn.release();

      // Send Order Confirmation Email
      emailService.sendOrderConfirmationEmail(req.user.email, req.user.name, {
        id: orderId,
        total_price: calculatedTotal,
        items: verifiedItems,
        shipping_address: shippingAddress,
        payment_method: paymentMethod || 'Paystack (Card/Momo)'
      });

      res.status(201).json({
        message: 'Order created successfully',
        orderId: `BTQ-${orderId}`,
        total: calculatedTotal
      });
    } catch (transactionError) {
      await conn.rollback();
      conn.release();

      // Gracefully handle ER_DUP_ENTRY when webhook races with frontend request
      if (transactionError.code === 'ER_DUP_ENTRY' || transactionError.errno === 1062) {
        console.warn(`Duplicate payment_reference ${paymentReference} caught during transaction. Returning existing order.`);
        const existing = await query('SELECT id, total_amount FROM orders WHERE payment_reference = ?', [paymentReference]);
        if (existing.length > 0) {
          return res.status(200).json({
            message: 'Order already processed',
            orderId: `BTQ-${existing[0].id}`,
            total: Number(existing[0].total_amount)
          });
        }
      }
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
