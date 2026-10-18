const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Product } = require('../models');
const jsonPath = path.resolve(__dirname, '../../ecom-furniture-main/ecom-furniture-main/src/data/products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function syncMongo() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGO_URI, using file cache only.');
    return;
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');
  let count = 0;
  for (const p of products) {
    await Product.findOneAndUpdate(
      { id: p.id },
      { $set: p },
      { upsert: true, new: true }
    );
    count++;
  }
  console.log(`Successfully synced ${count} products to MongoDB Atlas!`);
  await mongoose.disconnect();
}

syncMongo().catch(err => {
  console.error('Sync error:', err);
  process.exit(1);
});
