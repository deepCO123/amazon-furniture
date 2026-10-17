const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_1234567890_test';

describe('Auth API & RBAC Suite', () => {
  let customerToken = '';
  let adminToken = '';

  describe('POST /api/auth/customer-login', () => {
    it('should register a new customer when email does not exist', async () => {
      const uniqueEmail = `test_customer_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/customer-login')
        .send({
          email: uniqueEmail,
          password: 'Password123!',
          name: 'عميل اختباري',
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(uniqueEmail.toLowerCase());
      expect(res.headers['set-cookie']).toBeDefined();

      // Extract token cookie
      const cookie = res.headers['set-cookie'].find((c) => c.startsWith('token='));
      expect(cookie).toBeDefined();
      customerToken = cookie.split(';')[0].split('=')[1];
    });

    it('should login an existing customer with valid credentials', async () => {
      const email = `login_test_${Date.now()}@example.com`;
      // Create first
      await request(app).post('/api/auth/customer-login').send({
        email,
        password: 'SecurePassword123!',
        name: 'أحمد علي',
      });

      // Login
      const res = await request(app).post('/api/auth/customer-login').send({
        email,
        password: 'SecurePassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(email);
    });

    it('should reject invalid password for existing customer', async () => {
      const email = `fail_test_${Date.now()}@example.com`;
      await request(app).post('/api/auth/customer-login').send({
        email,
        password: 'CorrectPassword123!',
      });

      const res = await request(app).post('/api/auth/customer-login').send({
        email,
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with missing email or short password', async () => {
      const res1 = await request(app).post('/api/auth/customer-login').send({
        password: 'Password123!',
      });
      expect(res1.status).toBe(400);

      const res2 = await request(app).post('/api/auth/customer-login').send({
        email: `short_pw_${Date.now()}@test.com`,
        password: '123',
      });
      expect(res2.status).toBe(400);
    });
  });

  describe('POST /api/auth/admin-login', () => {
    it('should login admin with valid credentials', async () => {
      const res = await request(app).post('/api/auth/admin-login').send({
        email: 'admin@amazonfurniture.eg',
        password: 'Admin@Pass2026!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
      expect(res.body.token).toBeDefined();
      adminToken = res.body.token;
    });

    it('should reject admin login with invalid password', async () => {
      const res = await request(app).post('/api/auth/admin-login').send({
        email: 'admin@amazonfurniture.eg',
        password: 'WrongAdminPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject admin login with missing fields', async () => {
      const res = await request(app).post('/api/auth/admin-login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me & Token Verification', () => {
    it('should return user info when valid JWT is supplied via cookie or Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
    });

    it('should reject request when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request when token is forged or invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_forged_token_xyz');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject request when token is expired', async () => {
      const expiredToken = jwt.sign(
        { id: 'user_123', email: 'exp@test.com', role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('انتهت صلاحية الجلسة');
    });
  });

  describe('RBAC Authorization on Protected Routes', () => {
    it('should forbid customer from accessing admin-only endpoint', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to access admin-only endpoint', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.totalOrders).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear token cookie on logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cookie = res.headers['set-cookie']?.find((c) => c.startsWith('token='));
      expect(cookie).toBeDefined();
    });
  });
});
