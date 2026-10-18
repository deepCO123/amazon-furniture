const request = require('supertest');
const crypto = require('crypto');
const app = require('../server');
const paymobService = require('../services/paymobService');
const storageService = require('../services/storageService');
const jsonCache = require('../services/jsonCache');

describe('Production Readiness & Remediation Test Suite', () => {
  let customerToken = '';
  let adminToken = '';
  let customerEmail = `remediation_${Date.now()}@test.com`;
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

    it('should reject underpaid transactions in handleSuccessfulPayment', async () => {
      const orders = await jsonCache.read('orders.json', []);
      const testOrderId = `TEST-ORDER-${Date.now()}`;
      orders.push({
        id: testOrderId,
        total: 5000,
        paymentStatus: 'pending',
      });
      await jsonCache.write('orders.json', orders);

      // سداد 1000 جنيه (100000 قرش) بدلاً من 5000 جنيه (500000 قرش)
      const result = await paymobService.handleSuccessfulPayment(testOrderId, {
        id: 'tx_underpaid_1',
        amount_cents: 100000,
        currency: 'EGP',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Underpaid');

      const updatedOrders = await jsonCache.read('orders.json', []);
      const order = updatedOrders.find((o) => o.id === testOrderId);
      expect(order.paymentStatus).toBe('pending');
    });

    it('should reject invalid currency transactions in handleSuccessfulPayment', async () => {
      const orders = await jsonCache.read('orders.json', []);
      const testOrderId = `TEST-ORDER-${Date.now()}`;
      orders.push({
        id: testOrderId,
        total: 1000,
        paymentStatus: 'pending',
      });
      await jsonCache.write('orders.json', orders);

      const result = await paymobService.handleSuccessfulPayment(testOrderId, {
        id: 'tx_curr_1',
        amount_cents: 100000,
        currency: 'USD',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('currency');
    });

    it('should reject overpaid transactions in handleSuccessfulPayment', async () => {
      const orders = await jsonCache.read('orders.json', []);
      const testOrderId = `TEST-ORDER-${Date.now()}`;
      orders.push({
        id: testOrderId,
        total: 2000,
        paymentStatus: 'pending',
      });
      await jsonCache.write('orders.json', orders);

      // محاولة سداد 3000 جنيه (300000 قرش) بدلاً من 2000 جنيه (200000 قرش)
      const result = await paymobService.handleSuccessfulPayment(testOrderId, {
        id: 'tx_overpaid_1',
        amount_cents: 300000,
        currency: 'EGP',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Overpaid');

      const updatedOrders = await jsonCache.read('orders.json', []);
      const order = updatedOrders.find((o) => o.id === testOrderId);
      expect(order.paymentStatus).toBe('pending');
    });

    it('should handle duplicate callbacks idempotently without duplicate side effects', async () => {
      const orders = await jsonCache.read('orders.json', []);
      const testOrderId = `TEST-IDEMP-${Date.now()}`;
      orders.push({
        id: testOrderId,
        total: 1500,
        paymentStatus: 'pending',
      });
      await jsonCache.write('orders.json', orders);

      const validDetails = {
        id: 'tx_idemp_1',
        amount_cents: 150000,
        currency: 'EGP',
        source_data: { pan: '9988', sub_type: 'visa' },
      };

      // الضربة الأولى: يتم السداد بنجاح
      const res1 = await paymobService.handleSuccessfulPayment(testOrderId, validDetails);
      expect(res1.success).toBe(true);
      expect(res1.order.paymentStatus).toBe('paid');

      // الضربة الثانية المكررة (Duplicate Callback): تكتشف الحالة فوراً وترجع alreadyProcessed
      const res2 = await paymobService.handleSuccessfulPayment(testOrderId, validDetails);
      expect(res2.success).toBe(true);
      expect(res2.alreadyProcessed).toBe(true);
    });

    it('should handle concurrent webhook calls safely via processing mutex lock', async () => {
      const orders = await jsonCache.read('orders.json', []);
      const testOrderId = `TEST-CONCUR-${Date.now()}`;
      orders.push({
        id: testOrderId,
        total: 4000,
        paymentStatus: 'pending',
      });
      await jsonCache.write('orders.json', orders);

      const validDetails = {
        id: 'tx_concur_1',
        amount_cents: 400000,
        currency: 'EGP',
        source_data: { pan: '1234', sub_type: 'mastercard' },
      };

      // إطلاق طلبين متزامنين تماماً في نفس اللحظة
      const [r1, r2] = await Promise.all([
        paymobService.handleSuccessfulPayment(testOrderId, validDetails),
        paymobService.handleSuccessfulPayment(testOrderId, validDetails),
      ]);

      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      // يجب أن يكون أحدهما قد نجح والآخر أشار إما للمعالجة المسبقة أو القفل النشط
      const processedCount = [r1, r2].filter((r) => r.order && r.order.paymentStatus === 'paid').length;
      expect(processedCount).toBeGreaterThanOrEqual(1);
    });

    it('should reject pending, voided, or refunded transactions from marking order as paid', async () => {
      const payloadPending = {
        amount_cents: '385000',
        created_at: '2026-10-17T20:00:00.000Z',
        currency: 'EGP',
        error_occured: 'false',
        has_parent_transaction: 'false',
        id: '9988771',
        integration_id: '12345',
        is_3d_secure: 'true',
        is_auth: 'false',
        is_capture: 'false',
        is_refunded: 'false',
        is_standalone_payment: 'true',
        is_voided: 'false',
        order: { id: '554433', merchant_order_id: 'AF-PENDING-TEST' },
        owner: '1122',
        pending: 'true', // لا تزال معلقة
        source_data: { pan: '2345', sub_type: 'MasterCard', type: 'card' },
        success: 'true',
      };

      const concatenated = [
        payloadPending.amount_cents,
        payloadPending.created_at,
        payloadPending.currency,
        payloadPending.error_occured,
        payloadPending.has_parent_transaction,
        payloadPending.id,
        payloadPending.integration_id,
        payloadPending.is_3d_secure,
        payloadPending.is_auth,
        payloadPending.is_capture,
        payloadPending.is_refunded,
        payloadPending.is_standalone_payment,
        payloadPending.is_voided,
        payloadPending.order.id,
        payloadPending.owner,
        payloadPending.pending,
        payloadPending.source_data.pan,
        payloadPending.source_data.sub_type,
        payloadPending.source_data.type,
        payloadPending.success,
      ].join('');

      const validHmac = crypto
        .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
        .update(concatenated)
        .digest('hex');

      const res = await request(app)
        .post(`/api/payments/paymob/webhook?hmac=${validHmac}`)
        .send(payloadPending);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not successful');
    });

    it('should return 503 and ensure zero side effects (no order committed, no stock deducted) when MongoDB is disconnected in production', async () => {
      const origEnv = process.env.NODE_ENV;
      const origIsMongo = jsonCache.isMongoConnected;

      // أخذ لقطة من الحالة قبل التحويل لوضع الإنتاج
      const initialOrders = await jsonCache.read('orders.json', []);
      const initialProducts = await jsonCache.read('products.json', []);

      try {
        process.env.NODE_ENV = 'production';
        jsonCache.isMongoConnected = () => false;

        const res = await request(app).post('/api/orders').send({
          customerName: 'فحص انقطاع قاعدة البيانات',
          items: [{ productId: '1', quantity: 2 }],
        });
        expect(res.status).toBe(503);
        expect(res.body.error).toContain('غير متاحة');
      } finally {
        process.env.NODE_ENV = origEnv;
        jsonCache.isMongoConnected = origIsMongo;
      }

      // التحقق الحاسم بعد استعادة بيئة التطوير
      const afterOrders = await jsonCache.read('orders.json', []);
      const afterProducts = await jsonCache.read('products.json', []);

      expect(afterOrders.length).toBe(initialOrders.length);
      expect(afterProducts[0]?.stockQuantity).toBe(initialProducts[0]?.stockQuantity);
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
