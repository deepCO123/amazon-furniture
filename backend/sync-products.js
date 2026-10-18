const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

async function sync() {
  const jsonPath = path.resolve(__dirname, '..', 'ecom-furniture-main', 'ecom-furniture-main', 'src', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('Read', products.length, 'products from JSON');

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB');
      const { Product } = require('./models');
      const ops = products.map((doc) => ({
        updateOne: {
          filter: { id: doc.id },
          update: { $set: doc },
          upsert: true,
        },
      }));
      const res = await Product.bulkWrite(ops, { ordered: false });
      console.log('MongoDB bulkWrite:', res.upsertedCount, 'upserted,', res.modifiedCount, 'modified');
      const count = await Product.countDocuments();
      console.log('Total products in MongoDB now:', count);
      await mongoose.disconnect();
    } catch (e) {
      console.error('MongoDB sync error:', e.message);
    }
  }
}

sync();
