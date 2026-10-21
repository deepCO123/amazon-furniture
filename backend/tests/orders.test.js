const request = require('supertest');
const app = require('../server');

describe('Orders API & Checkout Suite', () => {
  let adminToken = '';
  let createdOrderId = '';
  let testProduct = { id: '1', name: 'كرسي مكتب شبك طبي هيدروليك إرجونوميك', price: 3850 };
  const testPhone = '01012345678';

  beforeAll(async () => {
    const adminRes = await request(app).post('/api/auth/admin-login').send({
      email: 'admin@amazonfurniture.eg',
      password: 'Admin@Pass2026!',
    });
    adminToken = adminRes.body.token;

    const prodRes = await request(app).get('/api/products');
    if (prodRes.body && Array.isArray(prodRes.body) && prodRes.body.length > 0) {
      testProduct = prodRes.body[0];
    }
  });

  describe('POST /api/orders', () => {
    it('should reject order with no items', async () => {
      const res = await request(app).post('/api/orders').send({
        customerName: 'فهد محمد',
        items: [],
        total: 0,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should create order and return 201 with generated orderId', async () => {
      const payload = {
        customerName: 'أحمد محمود',
        customerEmail: 'ahmed.orders@test.com',
        customerPhone: testPhone,
        items: [
          {
            product: {
              id: testProduct.id,
              name: testProduct.name,
              price: testProduct.price,
            },
            quantity: 1,
            color: 'بيج كابتشينو',
          },
        ],
        total: testProduct.price,
        shippingAddress: {
          firstName: 'أحمد',
          lastName: 'محمود',
          phone: testPhone,
          address: 'شارع الجمهورية - المنصورة',
          city: 'المنصورة',
        },
        paymentMethod: 'cod',
      };

      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.orderId).toBeDefined();
      expect(res.body.order).toBeDefined();
      expect(res.body.order.status).toBe('under_review');
      createdOrderId = res.body.orderId;
    });
  });

  describe('POST /api/orders/track', () => {
    it('should track order successfully with valid orderId and phone', async () => {
      const res = await request(app).post('/api/orders/track').send({
        orderId: createdOrderId,
        phone: testPhone,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.id).toBe(createdOrderId);
    });

    it('should reject tracking when phone number does not match', async () => {
      const res = await request(app).post('/api/orders/track').send({
        orderId: createdOrderId,
        phone: '01099999999',
      });

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it('should return 404 for non-existent orderId', async () => {
      const res = await request(app).post('/api/orders/track').send({
        orderId: 'AF-999999',
        phone: testPhone,
      });

      expect(res.status).toBe(404);
    });

    it('should return 400 when missing orderId or phone', async () => {
      const res = await request(app).post('/api/orders/track').send({
        orderId: createdOrderId,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders (Admin Only)', () => {
    it('should forbid unauthenticated users from fetching orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('should return all orders for admin', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.some((o) => o.id === createdOrderId);
      expect(found).toBe(true);
    });
  });

  describe('PATCH /api/orders (Status Update)', () => {
    it('should update order status to confirmed', async () => {
      const res = await request(app)
        .patch('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: createdOrderId,
          status: 'confirmed',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.status).toBe('confirmed');
    });

    it('should reject status update with missing orderId or status', async () => {
      const res = await request(app)
        .patch('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderId: createdOrderId });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/orders (Admin Only)', () => {
    it('should delete order successfully', async () => {
      const res = await request(app)
        .delete(`/api/orders?id=${createdOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedId).toBe(createdOrderId);
    });
  });
});
