/**
 * backend/config/db.js
 * إعداد وإدارة الاتصال بقاعدة بيانات MongoDB عبر Mongoose
 */

const dns = require('dns');
const mongoose = require('mongoose');

// حل مشكلة Node.js querySrv ECONNREFUSED على أنظمة Windows مع خوادم DNS المحلية
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore if custom DNS fails
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/amazon_furniture';

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10, // الحد الأقصى لاتصالات الـ Connection Pool
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log(`=============================================`);
    console.log(`🍃 MongoDB Connected Successfully!`);
    console.log(`🏢 Host: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
    console.log(`=============================================`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // لا نوقف الخادم كلياً حتى تستمر وظائف الـ Cache الاحتياطية في حال تعثر الاتصال الأولي
    throw error;
  }
};

// مراقبة أحداث الاتصال
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB connection re-established.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Runtime Error: ${err.message}`);
});

module.exports = connectDB;
