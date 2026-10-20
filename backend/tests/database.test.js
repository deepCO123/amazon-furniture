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
  CustomOrder,
  Coupon,
} = require('../models');
const { ensureCouponsInitialized, validateCouponLogic } = require('../routes/couponRoutes');

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

  describe('Coupon and CustomOrder Model Validation', () => {
    it('Coupon should require code, discountValue, and default to percentage', async () => {
      const coupon = new Coupon({});
      const err = await getValidationError(coupon);
      expect(err.errors.code).toBeDefined();
      expect(err.errors.discountValue).toBeDefined();

      const validCoupon = new Coupon({
        code: 'SAVE20',
        discountValue: 20,
      });
      expect(validCoupon.discountType).toBe('percentage');
      expect(validCoupon.isActive).toBe(true);
    });

    it('CustomOrder should require id, customerName, customerPhone, and furnitureType', async () => {
      const customOrder = new CustomOrder({});
      const err = await getValidationError(customOrder);
      expect(err.errors.id).toBeDefined();
      expect(err.errors.customerName).toBeDefined();
      expect(err.errors.customerPhone).toBeDefined();
      expect(err.errors.furnitureType).toBeDefined();
    });
  });

  describe('Production safety guardrails', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      jest.restoreAllMocks();
      jsonCache.clear();
    });

    it('must correctly map coupons and custom_orders in jsonCache', () => {
      expect(jsonCache.getDocFilter('coupons.json', { code: 'WELCOME10' })).toEqual({ code: 'WELCOME10' });
      expect(jsonCache.getDocFilter('custom_orders.json', { id: 'CST-100' })).toEqual({ id: 'CST-100' });
    });

    it('must not silently fall back to local JSON files in production when MongoDB is unavailable', async () => {
      process.env.NODE_ENV = 'production';
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(false);

      await expect(jsonCache.read('products.json', [])).rejects.toThrow(/MongoDB.*production|production.*MongoDB/i);
      await expect(jsonCache.write('products.json', [{ id: 'p_prod_guard' }])).rejects.toThrow(/MongoDB.*production|production.*MongoDB/i);
    });

    it('must return an empty array [] when MongoDB collection is empty, not falling back to JSON', async () => {
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(true);
      jest.spyOn(Product, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await jsonCache.read('products.json', ['default_should_not_return']);
      expect(result).toEqual([]);
      expect(Product.find).toHaveBeenCalled();
    });

    it('must propagate database read failure in production without falling back to JSON', async () => {
      process.env.NODE_ENV = 'production';
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(true);
      jest.spyOn(Product, 'find').mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Connection timeout')),
      });

      await expect(jsonCache.read('products.json', [])).rejects.toThrow(/Database Read Failure/i);
    });

    it('must not update RAM cache when database write fails', async () => {
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(true);
      jest.spyOn(Product, 'bulkWrite').mockRejectedValue(new Error('Write concern error'));

      const testData = [{ id: 'prod_failed_write', name: 'Failed Product' }];

      await expect(jsonCache.write('products.json', testData)).rejects.toThrow(/Database Write Failure/i);
      expect(jsonCache.cache.has('products.json')).toBe(false);
    });

    it('must perform non-destructive updates without deleting unmentioned documents', async () => {
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(true);
      const bulkWriteSpy = jest.spyOn(Product, 'bulkWrite').mockResolvedValue({ ok: 1 });
      const deleteManySpy = jest.spyOn(Product, 'deleteMany');

      const singleProduct = [{ id: 'p_single', name: 'Single Item' }];
      await jsonCache.write('products.json', singleProduct);

      expect(bulkWriteSpy).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: { id: 'p_single' },
              update: { $set: singleProduct[0] },
              upsert: true,
            },
          },
        ],
        { ordered: false }
      );
      // deleteMany must NEVER be called implicitly during write()
      expect(deleteManySpy).not.toHaveBeenCalled();
    });

    it('must delete only the intended document via deleteItem', async () => {
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(true);
      const deleteOneSpy = jest.spyOn(Product, 'deleteOne').mockResolvedValue({ deletedCount: 1 });

      jsonCache.cache.set('products.json', [
        { id: 'p_keep', name: 'Keep Item' },
        { id: 'p_delete', name: 'Delete Item' },
      ]);

      await jsonCache.deleteItem('products.json', 'p_delete');

      expect(deleteOneSpy).toHaveBeenCalledWith({ id: 'p_delete' });
      const cached = jsonCache.cache.get('products.json');
      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('p_keep');
    });

    it('must preserve customer passwordHash in cleanDocument for internal auth', () => {
      const rawCustomer = {
        _id: '507f1f77bcf86cd799439011',
        id: 'cust_01',
        name: 'أحمد',
        email: 'ahmed@test.com',
        passwordHash: '$2a$12$securehash123',
        __v: 0,
      };

      const cleaned = jsonCache.cleanDocument(rawCustomer);
      expect(cleaned.passwordHash).toBe('$2a$12$securehash123');
      expect(cleaned._id).toBeUndefined();
      expect(cleaned.__v).toBeUndefined();
    });

    it('must not automatically seed demo coupons in production when coupon collection is empty', async () => {
      process.env.NODE_ENV = 'production';
      jest.spyOn(jsonCache, 'isMongoConnected').mockReturnValue(true);
      const countSpy = jest.spyOn(Coupon, 'countDocuments');
      const createSpy = jest.spyOn(Coupon, 'create');
      const writeSpy = jest.spyOn(jsonCache, 'write');

      await ensureCouponsInitialized();

      expect(countSpy).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
      expect(writeSpy).not.toHaveBeenCalled();

      // Also verify validateCouponLogic in production when DB has no coupons
      jest.spyOn(Coupon, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      const validationResult = await validateCouponLogic('WELCOME10', 5000);
      expect(validationResult.valid).toBe(false);
      expect(createSpy).not.toHaveBeenCalled();
      expect(writeSpy).not.toHaveBeenCalled();
    });
  });
});
