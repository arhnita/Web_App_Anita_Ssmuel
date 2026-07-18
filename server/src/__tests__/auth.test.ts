import request from 'supertest';

const API_URL = 'https://web-app-anita-ssmuel.onrender.com';

describe('Auth API', () => {
  // Wake up the server first
  beforeAll(async () => {
    await request(API_URL).get('/api/health').timeout(60000);
  }, 90000);

  it('should login successfully', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({ email: 'admin@university.edu', password: 'password123' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 60000);

  it('should reject invalid login', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({ email: 'admin@university.edu', password: 'wrong' });
    
    expect(res.status).toBe(401);
  }, 60000);
});