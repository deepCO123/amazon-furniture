/**
 * backend/models/index.js
 * نقطة التجميع المركزية لكافة نماذج Mongoose
 */

const Product = require('./Product');
const Customer = require('./Customer');
const Order = require('./Order');
const Quotation = require('./Quotation');
const Return = require('./Return');
const Consultation = require('./Consultation');
const Email = require('./Email');
const Review = require('./Review');

module.exports = {
  Product,
  Customer,
  Order,
  Quotation,
  Return,
  Consultation,
  Email,
  Review,
};
