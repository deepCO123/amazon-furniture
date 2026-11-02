const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dns = require('dns');

// Windows DNS fix for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

async function sync() {
  const jsonPath = path.resolve(__dirname, '..', 'ecom-furniture-main', 'ecom-furniture-main', 'src', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('Read', products.length, 'products from JSON');

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
      console.log('Connected to MongoDB Atlas');
      const { Product } = require('./models');
      const ops = products.map((doc) => ({
        updateOne: {
          filter: { id: doc.id },
          update: { $set: doc },
          upsert: true,
        },
      }));
      const res = await Product.bulkWrite(ops, { ordered: false });
      console.log('MongoDB sync result:', {
        matched: res.matchedCount,
        modified: res.modifiedCount,
        upserted: res.upsertedCount,
      });
      await mongoose.disconnect();
    } catch (err) {
      console.error('MongoDB sync error:', err.message);
    }
  } else {
    console.log('No MONGO_URI, skipping Mongo sync');
  }

  // Also update jsonCache if exists
  try {
    const jsonCache = require('./services/jsonCache');
    await jsonCache.write('products', products);
    console.log('JSON cache updated successfully');
  } catch (err) {
    console.error('jsonCache error:', err.message);
  }
}

sync().then(() => console.log('Done'));
