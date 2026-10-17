const request = require('supertest');
const app = require('../server');

describe('Security & Protection Suite', () => {
  describe('NoSQL Injection Prevention', () => {
    it('should strip keys starting with $ or containing . from body', async () => {
      // Testing with customer login endpoint
      const res = await request(app)
        .post('/api/auth/customer-login')
        .send({
          email: { '$gt': '' },
          password: 'Password123!',
        });

      // Since $gt was stripped by sanitizeData, input is invalid and rejected with 400
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('XSS Prevention (Sanitization)', () => {
    it('should strip <script> tags and brackets from input strings', async () => {
      const xssName = '<script>alert("XSS")</script>محمد علي';
      const cleanEmail = `xss_test_${Date.now()}@example.com`;

      const res = await request(app)
        .post('/api/auth/customer-login')
        .send({
          email: cleanEmail,
          password: 'Password123!',
          name: xssName,
        });

      expect(res.status).toBe(201);
      expect(res.body.user.name).not.toContain('<script>');
      expect(res.body.user.name).not.toContain('</script>');
    });
  });

  describe('Security Headers (Helmet)', () => {
    it('should include secure HTTP headers on responses', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-xss-protection']).toBe('0');
      expect(res.headers['x-powered-by']).toBeUndefined(); // Powered by hidden
    });
  });

  describe('CORS Enforcement', () => {
    it('should block unauthorized origins', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://malicious-hacker-site.com');

      // Either CORS blocks or doesn't return Access-Control-Allow-Origin
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow legitimate client origin', async () => {
      const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
      const res = await request(app)
        .get('/health')
        .set('Origin', allowedOrigin);

      expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
    });
  });
});
