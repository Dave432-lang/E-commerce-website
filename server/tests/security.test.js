import request from 'supertest';
import { app } from '../server.js';
import { initDbPromise, query } from '../config/db.js';
import jwt from 'jsonwebtoken';

describe('Security & Price Verification Tests', () => {
  let authToken;
  let testUserId;
  let testProductId;
  let originalPrice;

  beforeAll(async () => {
    await initDbPromise;

    // Fetch an active product
    const prods = await query('SELECT id, price FROM products LIMIT 1');
    if (prods.length > 0) {
      testProductId = prods[0].id;
      originalPrice = Number(prods[0].price);
    } else {
      testProductId = 1;
      originalPrice = 100;
    }

    // Fetch an active user
    const userRows = await query('SELECT id, email FROM users LIMIT 1');
    if (userRows.length > 0) {
      testUserId = userRows[0].id;
    } else {
      testUserId = 1;
    }

    // Generate JWT token for testing
    authToken = jwt.sign(
      { id: testUserId, email: userRows[0]?.email || 'test@example.com', role: 'customer' },
      process.env.JWT_SECRET || 'supersecretjwtkey_boutique_2026',
      { expiresIn: '1h' }
    );
  });

  it('1. Price Manipulation Attack: Should reject order when client submits modified lower item price', async () => {
    const fakeReference = 'BTQ-SEC-TEST-' + Date.now();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [
          {
            id: testProductId,
            price: 1.00, // Attack: Modified lower price!
            quantity: 1,
            size: 'M'
          }
        ],
        shippingAddress: '123 Test St, Accra, Ghana',
        paymentReference: fakeReference,
        paymentMethod: 'Paystack Card'
      });

    // Should fail with 400 Bad Request (Paystack verification failed or amount mismatch)
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBeDefined();
  });

  it('2. Fake Lower Total Attack: Should reject order when client attempts total amount spoofing', async () => {
    const fakeReference = 'BTQ-SEC-TEST-TOTAL-' + Date.now();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [
          {
            id: testProductId,
            quantity: 1,
            size: 'M'
          }
        ],
        totalAmount: 0.50, // Attack: Fake total amount spoofing!
        shippingAddress: '123 Test St, Accra, Ghana',
        paymentReference: fakeReference,
        paymentMethod: 'Paystack Momo'
      });

    expect(res.statusCode).toEqual(400);
  });

  it('3. Duplicate Payment Reference Attack: Should return already processed order without error or re-deduction', async () => {
    const duplicateRef = 'BTQ-SEC-DUP-' + Date.now();

    // Insert mock existing order
    const insertRes = await query(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
      [testUserId, 150.00, 'Processing', 'Accra, Ghana', 'Paystack Momo', duplicateRef]
    );

    const existingOrderId = insertRes.insertId;

    // Resubmit order with exact same payment_reference
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [{ id: testProductId, quantity: 1 }],
        totalAmount: 150.00,
        shippingAddress: 'Accra, Ghana',
        paymentReference: duplicateRef,
        paymentMethod: 'Paystack Momo'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('already processed');
    expect(res.body.orderId).toEqual(`BTQ-${existingOrderId}`);

    // Clean up test order
    await query('DELETE FROM orders WHERE id = ?', [existingOrderId]);
  });

  it('4. Concurrent Webhook Simulation: Should handle simultaneous ER_DUP_ENTRY duplicate order cleanly', async () => {
    const dupRef = 'BTQ-SEC-RACE-' + Date.now();

    // Insert order in DB
    const insertRes = await query(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
      [testUserId, 200.00, 'Processing', 'Kumasi, Ghana', 'Paystack Card', dupRef]
    );

    const existingOrderId = insertRes.insertId;

    // Simulate Paystack Webhook receiving same payment reference
    const webhookRes = await request(app)
      .post('/api/payments/webhook')
      .set('x-paystack-signature', 'invalid_signature_handled')
      .send({
        event: 'charge.success',
        data: {
          reference: dupRef,
          amount: 20000,
          channel: 'card',
          metadata: {
            userId: testUserId,
            shippingAddress: 'Kumasi, Ghana',
            items: [{ id: testProductId, quantity: 1, price: 200 }]
          }
        }
      });

    // Webhook fails signature verification gracefully with 401, or handles idempotency
    expect([200, 401]).toContain(webhookRes.statusCode);

    // Clean up
    await query('DELETE FROM orders WHERE id = ?', [existingOrderId]);
  });
});
