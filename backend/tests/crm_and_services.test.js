const request = require('supertest');
const app = require('../server');

describe('CRM, Services, Feed & Integration Suite', () => {
  let adminToken = '';

  beforeAll(async () => {
    const adminRes = await request(app).post('/api/auth/admin-login').send({
      email: 'admin@amazonfurniture.eg',
      password: 'Admin@Pass2026!',
    });
    adminToken = adminRes.body.token;
  });

  describe('Health Check Endpoint', () => {
    it('GET /health should return 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Product Feed (Google Merchant & Meta Catalog)', () => {
    it('GET /api/feed/products should return valid XML RSS 2.0 Feed', async () => {
      const res = await request(app).get('/api/feed/products');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('xml');
      expect(res.text).toContain('<?xml');
      expect(res.text).toContain('<rss');
      expect(res.text).toContain('<channel>');
    });

    it('GET /api/feed/products?format=json should return JSON format', async () => {
      const res = await request(app).get('/api/feed/products?format=json');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
    });
  });

  describe('Customers CRM (/api/customers)', () => {
    it('POST /api/customers should create or sync a customer', async () => {
      const uniqueEmail = `crm_test_${Date.now()}@test.com`;
      const res = await request(app).post('/api/customers').send({
        name: 'عميل المنصورة',
        email: uniqueEmail,
        phone: '01055554444',
        city: 'المنصورة',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.customer.email).toBe(uniqueEmail);
    });

    it('GET /api/customers should be protected and return enriched list for admin', async () => {
      const unauth = await request(app).get('/api/customers');
      expect(unauth.status).toBe(401);

      const auth = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(auth.status).toBe(200);
      expect(Array.isArray(auth.body)).toBe(true);
    });
  });

  describe('Consultations Booking (/api/consultations)', () => {
    let consultationId = '';

    it('POST /api/consultations should register a new free consultation request', async () => {
      const res = await request(app).post('/api/consultations').send({
        fullName: 'سارة خالد',
        phone: '01011112222',
        consultType: 'mansoura',
        spaceType: 'شقة سكنية دوبلكس',
        preferredTime: 'غداً مساءً',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.id).toBeDefined();
      consultationId = res.body.booking.id;
    });

    it('PATCH /api/consultations should update consultation status for admin', async () => {
      const res = await request(app)
        .patch('/api/consultations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          id: consultationId,
          status: 'contacted',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe('contacted');
    });
  });

  describe('Quotations (/api/quotations)', () => {
    let quotationId = '';

    it('POST /api/quotations should create quotation draft', async () => {
      const res = await request(app).post('/api/quotations').send({
        customerName: 'شركة النيل للمقاولات',
        customerPhone: '01022223333',
        companyName: 'النيل جروب',
        items: [
          { name: 'مكتب مدير تنفيذي', quantity: 3, unitPrice: 15000, total: 45000 },
        ],
        subtotal: 45000,
        total: 45000,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.quotation.id).toBeDefined();
      quotationId = res.body.quotation.id;
    });

    it('DELETE /api/quotations should delete quotation for admin', async () => {
      const res = await request(app)
        .delete(`/api/quotations?id=${quotationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Returns & Replacements (/api/returns)', () => {
    let returnId = '';

    it('POST /api/returns should create a new return request', async () => {
      const res = await request(app).post('/api/returns').send({
        orderId: 'AF-100200',
        customerName: 'طارق كامل',
        customerPhone: '01077778888',
        productName: 'ترابيزة جانبية مودرن',
        productId: 'prod_side_table',
        price: 2500,
        reason: 'color_mismatch',
        reasonDetails: 'اللون أغمق قليلاً من الصورة',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.returnRequest.id).toBeDefined();
      returnId = res.body.returnRequest.id;
    });

    it('PATCH /api/returns should update return status and refund amount', async () => {
      const res = await request(app)
        .patch('/api/returns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          returnId,
          status: 'inspection_approved',
          refundAmount: 2500,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.returnRequest.status).toBe('inspection_approved');
    });
  });

  describe('OTP Service (/api/otp)', () => {
    const otpPhone = '01099998888';
    let receivedOtp = '';

    it('POST /api/otp/send should generate OTP and return expiresIn', async () => {
      const res = await request(app).post('/api/otp/send').send({
        phone: otpPhone,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.expiresInSeconds).toBe(300);
      receivedOtp = res.body.debugOtp || '123456';
    });

    it('POST /api/otp/verify should reject incorrect OTP', async () => {
      const res = await request(app).post('/api/otp/verify').send({
        phone: otpPhone,
        otp: '000000',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/otp/verify should verify correct OTP', async () => {
      if (receivedOtp) {
        const res = await request(app).post('/api/otp/verify').send({
          phone: otpPhone,
          otp: receivedOtp,
        });

        expect(res.status).toBe(200);
        expect(res.body.verified).toBe(true);
      }
    });
  });

  describe('Reviews & Ratings (/api/reviews)', () => {
    it('GET /api/reviews should return list of reviews', async () => {
      const res = await request(app).get('/api/reviews');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/reviews should create a review in pending status', async () => {
      const res = await request(app).post('/api/reviews').send({
        productId: 'prod_1',
        userName: 'منى إبراهيم',
        rating: 5,
        comment: 'خامة الخشب ممتازة جداً والتوصيل كان في الموعد!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.review.status).toBe('pending');
    });
  });

  describe('Cache Metrics & Backup (/api/cache-stats & /api/backup)', () => {
    it('GET /api/cache-stats should return metrics for admin', async () => {
      const res = await request(app)
        .get('/api/cache-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics).toBeDefined();
      expect(res.body.metrics.hitRate).toBeDefined();
    });
  });
});
