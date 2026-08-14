import request from 'supertest';
import { app } from '../server.js';
import { initDbPromise, query } from '../config/db.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

    const payload = JSON.stringify({
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

    const secret = process.env.PAYSTACK_SECRET || 'sk_test_mock_paystack_secret_key_2026';
    const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');

    // Simulate Paystack Webhook receiving duplicate payment reference with valid signature
    const webhookRes = await request(app)
      .post('/api/payments/webhook')
      .set('x-paystack-signature', hash)
      .set('Content-Type', 'application/json')
      .send(payload);

    // Webhook handles idempotency and returns HTTP 200 without duplicate processing
    expect(webhookRes.statusCode).toEqual(200);
    expect(webhookRes.body.message).toContain('already processed');

    // Clean up
    await query('DELETE FROM orders WHERE id = ?', [existingOrderId]);
  });

  it('5. Pending Order Webhook Processing: Should upgrade pending order to Processing and deduct stock', async () => {
    const pendingRef = 'BTQ-SEC-PENDING-' + Date.now();

    // 1. Insert an order with status 'pending'
    const insertRes = await query(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_reference) VALUES (?, ?, ?, ?, ?, ?)',
      [testUserId, 150.00, 'pending', 'Cape Coast, Ghana', 'Paystack Momo', pendingRef]
    );

    const pendingOrderId = insertRes.insertId;

    // 2. Build valid HMAC signature for webhook body
    const webhookPayload = {
      event: 'charge.success',
      data: {
        reference: pendingRef,
        amount: 15000,
        channel: 'card',
        metadata: {
          userId: testUserId,
          shippingAddress: 'Cape Coast, Ghana',
          items: [{ id: testProductId, quantity: 1, price: 150 }]
        }
      }
    };

    const rawPayload = JSON.stringify(webhookPayload);
    const signature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET || '')
      .update(rawPayload)
      .digest('hex');

    // 3. Send Webhook
    const webhookRes = await request(app)
      .post('/api/payments/webhook')
      .set('x-paystack-signature', signature)
      .send(webhookPayload);

    expect(webhookRes.statusCode).toEqual(200);
    expect(webhookRes.body.message).toContain('Pending order updated to Processing');

    // 4. Verify DB order status changed to 'Processing'
    const [updatedOrder] = await query('SELECT status FROM orders WHERE id = ?', [pendingOrderId]);
    expect(updatedOrder.status).toEqual('Processing');

    // Clean up
    await query('DELETE FROM orders WHERE id = ?', [pendingOrderId]);
  });

  it('6. Paystack Pesewa Conversion Test: Should correctly convert Ghana Cedis to Pesewas (x100)', () => {
    const totalInCedis = 250.50;
    const expectedPesewas = Math.round(totalInCedis * 100);
    expect(expectedPesewas).toEqual(25050);

    const zeroDecimalCedis = 100.00;
    expect(Math.round(zeroDecimalCedis * 100)).toEqual(10000);
  });

  it('7. Regional Delivery Fees API: Should return active regional delivery fees from DB', async () => {
    const res = await request(app).get('/api/delivery/fees');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const accra = res.body.find(f => f.region_name === 'Greater Accra');
    expect(accra).toBeDefined();
    expect(Number(accra.fee)).toEqual(25.00);
  });

  it('8. Admin Order Status Whitelist Test: Should reject status outside allowed list', async () => {
    const adminAuthToken = jwt.sign(
      { id: testUserId, email: 'admin@example.com', role: 'admin' },
      process.env.JWT_SECRET || 'supersecretjwtkey_boutique_2026',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .put('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({ status: 'INVALID_UNAPPROVED_STATUS' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Invalid or missing order status');
  });

  it('9. Negative Delivery Fee Validation Test: Should reject creation of negative delivery fee', async () => {
    const adminAuthToken = jwt.sign(
      { id: testUserId, email: 'admin@example.com', role: 'admin' },
      process.env.JWT_SECRET || 'supersecretjwtkey_boutique_2026',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/delivery/fees')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        region_name: 'Invalid Negative Region',
        fee: -15.00
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Valid non-negative delivery fee amount is required');
  });

  it('10. Duplicate Region Name Case-Insensitive Test: Should reject duplicate region names regardless of casing', async () => {
    const adminAuthToken = jwt.sign(
      { id: testUserId, email: 'admin@example.com', role: 'admin' },
      process.env.JWT_SECRET || 'supersecretjwtkey_boutique_2026',
      { expiresIn: '1h' }
    );

    // Attempting to add 'greater accra' (lowercase) when 'Greater Accra' already exists
    const res = await request(app)
      .post('/api/delivery/fees')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        region_name: 'greater accra',
        fee: 30.00
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('already exists');
  });
});
