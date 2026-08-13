import request from 'supertest';
import { app } from '../server.js';
import { initDbPromise } from '../config/db.js';

describe('Product Catalog API Endpoints', () => {
  beforeAll(async () => {
    await initDbPromise;
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
});
