const request = require('supertest');
const app = require('../server');

describe('Products API Suite', () => {
  let adminToken = '';
  let customerToken = '';
  let createdProductId = '';

  beforeAll(async () => {
    // Obtain admin token
    const adminRes = await request(app).post('/api/auth/admin-login').send({
      email: 'admin@amazonfurniture.eg',
      password: 'Admin@Pass2026!',
    });
    adminToken = adminRes.body.token;

    // Obtain customer token
    const custRes = await request(app).post('/api/auth/customer-login').send({
      email: `prod_test_${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Customer Test',
    });
    const cookie = custRes.headers['set-cookie']?.find((c) => c.startsWith('token='));
    if (cookie) customerToken = cookie.split(';')[0].split('=')[1];
  });

  describe('GET /api/products', () => {
    it('should return list of products with 200 status', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).post('/api/products').send({
        name: 'طاولة طعام فاخرة',
        price: 12000,
        category: 'غرف طعام',
      });
      expect(res.status).toBe(401);
    });

    it('should reject customer role with 403', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'طاولة طعام فاخرة',
          price: 12000,
          category: 'غرف طعام',
        });
      expect(res.status).toBe(403);
    });

    it('should reject missing required fields with 400', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'طاولة بدون سعر أو قسم',
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should allow admin to create a new product', async () => {
      const newProductPayload = {
        name: 'كرسي مودرن اختبار',
        code: 'GL-999',
        price: 3500,
        category: 'كراسي',
        material: 'خشب زان طبيعي',
        stockQuantity: 15,
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProductPayload);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe(newProductPayload.name);
      expect(res.body.price).toBe(3500);
      expect(res.body.stockQuantity).toBe(15);
      createdProductId = res.body.id;
    });
  });

  describe('PUT /api/products', () => {
    it('should update product price and details successfully', async () => {
      const res = await request(app)
        .put('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          id: createdProductId,
          price: 4200,
          material: 'خشب أرو ماسيف',
        });

      expect(res.status).toBe(200);
      expect(res.body.price).toBe(4200);
      expect(res.body.material).toBe('خشب أرو ماسيف');
    });

    it('should return 400 if product id is missing', async () => {
      const res = await request(app)
        .put('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 5000 });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent product id', async () => {
      const res = await request(app)
        .put('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id: 'non_existent_id_99999', price: 5000 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products', () => {
    it('should delete product successfully by query param', async () => {
      const res = await request(app)
        .delete(`/api/products?id=${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedId).toBe(createdProductId);
    });

    it('should return 404 when attempting to delete non-existent product', async () => {
      const res = await request(app)
        .delete('/api/products?id=non_existent_id_99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
