const mongoose = require('mongoose');
const jsonCache = require('../services/jsonCache');
const {
  Product,
  Customer,
  Order,
  Quotation,
  Return,
  Consultation,
  Review,
  Email,
} = require('../models');

const getValidationError = async (doc) => {
  try {
    await doc.validate();
    return null;
  } catch (err) {
    return err;
  }
};

describe('Mongoose Models & Schema Validation Suite', () => {
  describe('Product Model Validation', () => {
    it('should validate required fields (name, slug, price, category)', async () => {
      const product = new Product({});
      const err = await getValidationError(product);
      expect(err.errors.name).toBeDefined();
      expect(err.errors.slug).toBeDefined();
      expect(err.errors.price).toBeDefined();
      expect(err.errors.category).toBeDefined();
    });

    it('should enforce price >= 0 and rating between 1 and 5', async () => {
      const product = new Product({
        id: 'p_test',
        name: 'كرسي',
        slug: 'chair-1',
        category: 'كراسي',
        price: -50,
        rating: 6,
      });
      const err = await getValidationError(product);
      expect(err.errors.price).toBeDefined();
      expect(err.errors.rating).toBeDefined();
    });

    it('should have proper defaults for material, stockQuantity, inStock', () => {
      const product = new Product({
        id: 'p_test_2',
        name: 'طاولة',
        slug: 'table-1',
        category: 'طاولات',
        price: 1500,
      });
      expect(product.material).toBe('خشب طبيعي');
      expect(product.stockQuantity).toBe(10);
      expect(product.inStock).toBe(true);
    });
  });

  describe('Customer Model Validation', () => {
    it('should validate required fields (name, email)', async () => {
      const customer = new Customer({});
      const err = await getValidationError(customer);
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('should only allow valid roles (customer, admin)', async () => {
      const customer = new Customer({
        id: 'c_test',
        name: 'سالم',
        email: 'salem@test.com',
        role: 'super_hacker',
      });
      const err = await getValidationError(customer);
      expect(err.errors.role).toBeDefined();
    });

    it('should hide passwordHash in toJSON transform', () => {
      const customer = new Customer({
        id: 'c_test_json',
        name: 'سالم',
        email: 'salem@test.com',
        passwordHash: '$2a$12$hashedpassword',
      });
      const json = customer.toJSON();
      expect(json.passwordHash).toBeUndefined();
      expect(json._id).toBeUndefined();
    });
  });

  describe('Order Model Validation', () => {
    it('should require customerName, customerEmail, and total', async () => {
      const order = new Order({});
      const err = await getValidationError(order);
      expect(err.errors.customerName).toBeDefined();
      expect(err.errors.customerEmail).toBeDefined();
      expect(err.errors.total).toBeDefined();
    });

    it('should only accept allowed status values', async () => {
      const order = new Order({
        id: 'AF-111111',
        customerName: 'فهد',
        customerEmail: 'fahad@test.com',
        total: 500,
        status: 'invalid_status_xyz',
      });
      const err = await getValidationError(order);
      expect(err.errors.status).toBeDefined();
    });

    it('should accept valid status and payment methods', async () => {
      const order = new Order({
        id: 'AF-222222',
        customerName: 'فهد',
        customerEmail: 'fahad@test.com',
        total: 500,
        status: 'confirmed',
        paymentMethod: 'instapay',
        paymentStatus: 'pending',
      });
      const err = await getValidationError(order);
      expect(err).toBeNull();
    });
  });

  describe('Consultation, Quotation & Return Models', () => {
    it('Consultation should require fullName and phone', async () => {
      const c = new Consultation({});
      const err = await getValidationError(c);
      expect(err.errors.fullName).toBeDefined();
      expect(err.errors.phone).toBeDefined();
    });

    it('Quotation should require customerName', async () => {
      const q = new Quotation({});
      const err = await getValidationError(q);
      expect(err.errors.customerName).toBeDefined();
    });

    it('Return should require orderId, customerName, and productName', async () => {
      const r = new Return({});
      const err = await getValidationError(r);
      expect(err.errors.orderId).toBeDefined();
      expect(err.errors.customerName).toBeDefined();
      expect(err.errors.productName).toBeDefined();
    });
  });

  describe('Review and Email Models', () => {
    it('Review should require productId, userName, rating, comment', async () => {
      const rev = new Review({});
      const err = await getValidationError(rev);
      expect(err.errors.productId).toBeDefined();
      expect(err.errors.userName).toBeDefined();
      expect(err.errors.rating).toBeDefined();
      expect(err.errors.comment).toBeDefined();
    });

    it('Email should require to and subject', async () => {
      const mail = new Email({});
      const err = await getValidationError(mail);
      expect(err.errors.to).toBeDefined();
      expect(err.errors.subject).toBeDefined();
    });
  });

  describe('Production safety guardrails', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      jest.restoreAllMocks();
    });

    it('must not silently fall back to local JSON files in production when MongoDB is unavailable', async () => {
      process.env.NODE_ENV = 'production';
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(false);

      await expect(jsonCache.read('products.json', [])).rejects.toThrow(/MongoDB.*production|production.*MongoDB/i);
      await expect(jsonCache.write('products.json', [{ id: 'p_prod_guard' }])).rejects.toThrow(/MongoDB.*production|production.*MongoDB/i);
    });
  });
});
