import request from 'supertest';
import { app } from '../server.js';
import { initDbPromise } from '../config/db.js';

describe('Coupon Promo API Endpoints', () => {
  beforeAll(async () => {
    await initDbPromise;
  });
  it('POST /api/coupons/validate should reject empty coupon code', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: '', orderTotal: 100 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('required');
  });

  it('POST /api/coupons/validate should reject invalid promo code', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'INVALIDCODE99', orderTotal: 100 });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toContain('Invalid or expired');
  });

  it('POST /api/coupons/validate should validate valid coupon WELCOME10', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'WELCOME10', orderTotal: 100 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.discountValue).toBe(10);
    expect(res.body.discountAmount).toBe(10);
    expect(res.body.newTotal).toBe(90);
  });
});
