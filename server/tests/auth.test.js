import request from 'supertest';
import { app } from '../server.js';
import { initDbPromise } from '../config/db.js';

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    await initDbPromise;
  });
  it('GET / should return API running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('API is running');
  });

  it('POST /api/auth/register should fail when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/auth/login should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('POST /api/auth/forgot-password should return success message without leaking credentials', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'testuser@example.com' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('password reset link has been sent');
    expect(res.body.resetToken).toBeUndefined(); // Verify raw token is NOT returned in response
  });
});
