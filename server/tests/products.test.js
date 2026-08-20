import request from 'supertest';
import { app } from '../server.js';
import { initDbPromise, query } from '../config/db.js';
import jwt from 'jsonwebtoken';

describe('Product Catalog API Endpoints', () => {
  let adminToken;
  let customerToken;

  beforeAll(async () => {
    await initDbPromise;

    const adminUser = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const customerUser = await query("SELECT id FROM users WHERE role = 'customer' LIMIT 1");

    const adminUserId = adminUser[0]?.id || 1;
    const customerUserId = customerUser[0]?.id || 2;

    adminToken = jwt.sign(
      { id: adminUserId, email: 'admin@boutique.com', role: 'admin' },
      process.env.JWT_SECRET || 'supersecretjwtkey_boutique_2026',
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { id: customerUserId, email: 'customer@example.com', role: 'customer' },
      process.env.JWT_SECRET || 'supersecretjwtkey_boutique_2026',
      { expiresIn: '1h' }
    );
  });

  it('GET /api/products should return a list of non-archived products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Ensure all returned products have valid price, stock, and rating fields
    res.body.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('stock_quantity');
      expect(product.is_archived).toBeFalsy(); // Stores 0 or false
    });
  });

  it('GET /api/products/:id should return 404 for invalid product id', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.statusCode).toEqual(404);
  });

  it('POST /api/admin/products should reject unauthenticated or non-admin requests', async () => {
    // Unauthenticated
    const resUnauth = await request(app)
      .post('/api/admin/products')
      .send({ name: 'Test Coat', price: 150, category: 'Coats', imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985' });
    expect(resUnauth.statusCode).toBe(401);

    // Customer role
    const resCust = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Test Coat', price: 150, category: 'Coats', imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985' });
    expect(resCust.statusCode).toBe(403);
  });

  it('POST /api/admin/products should successfully create a new product when authorized as admin', async () => {
    const newProduct = {
      name: 'Luxury Silk Evening Gown',
      description: 'Handcrafted mulberry silk gown with metallic embroidered trim.',
      price: 350.00,
      salePrice: 299.99,
      gender: 'women',
      category: 'Dresses',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      stockQuantity: 25,
      isFeatured: true,
      isNewArrival: true,
      sizes: ['S', 'M', 'L'],
      colors: ['Emerald', 'Gold']
    };

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Luxury Silk Evening Gown');
    expect(res.body.price).toBe(350.00);
    expect(res.body.stockQuantity).toBe(25);
  });
});
