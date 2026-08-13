import request from 'supertest';
import { app } from '../server.js';

describe('Reviews API Endpoints', () => {
  it('GET /api/reviews/product/:productId should return review array', async () => {
    const res = await request(app).get('/api/reviews/product/1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/reviews/product/:productId should reject unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/reviews/product/1')
      .send({ rating: 5, comment: 'Awesome quality product!' });
    
    expect(res.statusCode).toEqual(401);
  });
});
