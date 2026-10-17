const request = require('supertest');
const crypto = require('crypto');
const app = require('../server');
const paymobService = require('../services/paymobService');
const storageService = require('../services/storageService');
const jsonCache = require('../services/jsonCache');

describe('Production Readiness & Remediation Test Suite', () => {
  let customerToken = '';
  let adminToken = '';
  const customerEmail = 'remediation_client@test.com';
  const customerPassword = 'SecureClientPass2026!';

  beforeAll(async () => {
    // 1. تسجيل عميل موثق
    const loginRes = await request(app).post('/api/auth/customer-login').send({
      email: customerEmail,
      password: customerPassword,
      name: 'عميل الفحص الشامل',
    });
    // الحصول على التوكن من الـ cookie
    const cookies = loginRes.headers['set-cookie'];
    if (cookies) {
      const match = cookies[0].match(/token=([^;]+)/);
      if (match) customerToken = match[1];
    }

    // 2. تسجيل الأدمن
    const adminRes = await request(app).post('/api/auth/admin-login').send({
      email: 'admin@amazonfurniture.eg',
      password: 'Admin@Pass2026!',
    });
    adminToken = adminRes.body.token;
  });

  // ─── 1. اختبارات خدمة Paymob والدفع الإلكتروني ───────────────────
  describe('Paymob Payment & Webhook Verification', () => {
    const originalSecret = process.env.PAYMOB_HMAC_SECRET;

    beforeAll(() => {
      process.env.PAYMOB_HMAC_SECRET = 'test_hmac_secret_key_12345';
    });

    afterAll(() => {
      process.env.PAYMOB_HMAC_SECRET = originalSecret;
    });

    it('should correctly verify valid Paymob HMAC SHA-512 signature', () => {
      const payload = {
        amount_cents: '385000',
        created_at: '2026-10-17T20:00:00.000Z',
        currency: 'EGP',
        error_occured: 'false',
        has_parent_transaction: 'false',
        id: '998877',
        integration_id: '12345',
        is_3d_secure: 'true',
        is_auth: 'false',
        is_capture: 'false',
        is_refunded: 'false',
        is_standalone_payment: 'true',
        is_voided: 'false',
        order: { id: '554433' },
        owner: '1122',
        pending: 'false',
        source_data: { pan: '2345', sub_type: 'MasterCard', type: 'card' },
        success: 'true',
      };

      const concatenated = [
        payload.amount_cents,
        payload.created_at,
        payload.currency,
        payload.error_occured,
        payload.has_parent_transaction,
        payload.id,
        payload.integration_id,
        payload.is_3d_secure,
        payload.is_auth,
        payload.is_capture,
        payload.is_refunded,
        payload.is_standalone_payment,
        payload.is_voided,
        payload.order.id,
        payload.owner,
        payload.pending,
        payload.source_data.pan,
        payload.source_data.sub_type,
        payload.source_data.type,
        payload.success,
      ].join('');

      const validHmac = crypto
        .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
        .update(concatenated)
        .digest('hex');

      const isValid = paymobService.verifyHmac(payload, validHmac);
      expect(isValid).toBe(true);

      // توقيع خاطئ
      const isInvalid = paymobService.verifyHmac(payload, 'wrong_tampered_hmac_signature');
      expect(isInvalid).toBe(false);
    });

    it('should reject webhook with 401 when HMAC signature is invalid', async () => {
      const res = await request(app)
        .post('/api/payments/paymob/webhook?hmac=fake_invalid_hmac')
        .send({ success: true, order: { merchant_order_id: 'AF-999999' } });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid HMAC signature');
    });
  });

  // ─── 2. اختبارات الكوبونات الديناميكية ───────────────────────────
  describe('Dynamic Coupons Management & Server Validation', () => {
    it('should validate active coupon and calculate server-side discount', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'WELCOME10', subtotal: 5000, email: customerEmail });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.discount).toBe(500); // 10% of 5000
    });

    it('should reject coupon if subtotal is below minimum order total', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'WELCOME10', subtotal: 1000, email: customerEmail });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.message).toContain('الحد الأدنى');
    });

    it('should allow admin to create a new dynamic coupon', async () => {
      const uniqueCode = `TESTPROMO_${Date.now()}`;
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: uniqueCode,
          discountType: 'fixed',
          discountValue: 300,
          minOrderTotal: 1500,
          usageLimit: 50,
          descriptionAr: 'خصم تجريبي بقيمة 300 ج.م',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.coupon.code).toBe(uniqueCode);

      // فحص إمكانية تطبيقه فوراً
      const valRes = await request(app)
        .post('/api/coupons/validate')
        .send({ code: uniqueCode, subtotal: 2000 });

      expect(valRes.body.valid).toBe(true);
      expect(valRes.body.discount).toBe(300);
    });

    it('should prevent non-admin from creating coupons', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: 'HACKER_CODE', discountValue: 900 });

      expect(res.status).toBe(403);
    });
  });

  // ─── 3. اختبارات الملف الشخصي والخصوصية ──────────────────────────
  describe('Customer Profile & Address Management', () => {
    it('should reject unauthenticated access to /api/customers/me', async () => {
      const res = await request(app).get('/api/customers/me');
      expect(res.status).toBe(401);
    });

    it('should allow authenticated customer to read their own profile without exposing passwordHash', async () => {
      const res = await request(app)
        .get('/api/customers/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.customer.email.toLowerCase()).toBe(customerEmail.toLowerCase());
      expect(res.body.customer.passwordHash).toBeUndefined();
    });

    it('should allow customer to update profile info and saved addresses', async () => {
      const res = await request(app)
        .patch('/api/customers/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'عميل الفحص المحدث',
          phone: '01099887766',
          city: 'المنصورة',
          address: 'شارع قناة السويس، برج الأمل',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.customer.name).toBe('عميل الفحص المحدث');
      expect(res.body.customer.phone).toBe('01099887766');
    });

    it('should securely change password when current password is valid', async () => {
      const newPass = 'BrandNewPassword2026!';
      const res = await request(app)
        .post('/api/customers/change-password')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          currentPassword: customerPassword,
          newPassword: newPass,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // محاولة تسجيل الدخول بكلمة المرور القديمة يجب أن تفشل
      const oldLogin = await request(app).post('/api/auth/customer-login').send({
        email: customerEmail,
        password: customerPassword,
      });
      expect(oldLogin.status).toBe(401);

      // تسجيل الدخول بكلمة المرور الجديدة ينجح
      const newLogin = await request(app).post('/api/auth/customer-login').send({
        email: customerEmail,
        password: newPass,
      });
      expect(newLogin.status).toBe(200);
    });
  });

  // ─── 4. اختبارات خدمة التخزين السحابي المركزية ───────────────────
  describe('Storage Service Behavior', () => {
    it('should provide safe local disk fallback and valid structure in development', async () => {
      const dummyBuffer = Buffer.from('fake_image_bytes_for_testing');
      const result = await storageService.uploadBuffer(dummyBuffer, {
        originalName: 'test-desk-design.jpg',
        folder: 'amazon-furniture/tests',
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.publicId).toBeDefined();

      // حذف الملف التجريبي للتنظيف
      await storageService.deleteFile(result.url);
    });
  });

  // ─── 5. اختبارات تفصيل الأثاث والموافقة على عروض الأسعار ─────────
  describe('Custom Orders Quote Response Workflow', () => {
    let customOrderId = '';

    beforeAll(async () => {
      const coRes = await request(app).post('/api/custom-orders').send({
        customerName: 'عميل التفصيل',
        customerPhone: '01011112222',
        customerEmail: customerEmail,
        furnitureType: 'ركنة مودرن حرف L',
        dimensions: { length: 300, width: 200, height: 85 },
      });
      customOrderId = coRes.body.customOrder.id;

      // يقوم الأدمن بتحديد السعر
      await request(app)
        .patch(`/api/custom-orders/${customOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'priced', quotePrice: 18500 });
    });

    it('should allow customer to fetch their own custom orders securely', async () => {
      const res = await request(app)
        .get('/api/custom-orders/my-orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.customOrders)).toBe(true);
      const found = res.body.customOrders.find((c) => c.id === customOrderId);
      expect(found).toBeDefined();
      expect(found.quotePrice).toBe(18500);
    });

    it('should allow customer to approve the quoted estimate', async () => {
      const res = await request(app)
        .patch(`/api/custom-orders/${customOrderId}/respond`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ decision: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.customOrder.status).toBe('in_production');
      expect(res.body.customOrder.customerDecision).toBe('approved');
    });
  });
});
