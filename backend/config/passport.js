/**
 * backend/config/passport.js
 * إعداد إستراتيجية Google OAuth 2.0 عبر Passport.js
 * 
 * عند نجاح تسجيل الدخول عبر Google:
 * 1. يبحث عن العميل في MongoDB بناءً على googleId أو البريد الإلكتروني
 * 2. إذا كان العميل جديداً، يُنشئ حساباً جديداً تلقائياً
 * 3. يُرجع بيانات العميل لتوليد JWT
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Customer = require('../models/Customer');

const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ Google OAuth credentials not configured. Google login will be disabled.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = (profile.emails && profile.emails[0]?.value || '').toLowerCase();
          const name = profile.displayName || email.split('@')[0];
          const avatar = profile.photos && profile.photos[0]?.value || '';

          // 1. البحث عن العميل بواسطة googleId
          let customer = await Customer.findOne({ googleId });

          // 2. إذا لم يُعثر عليه، البحث بواسطة البريد الإلكتروني
          if (!customer && email) {
            customer = await Customer.findOne({ email });
            if (customer) {
              // ربط حساب Google بحساب عميل موجود مسبقاً
              customer.googleId = googleId;
              customer.provider = 'google';
              if (avatar && !customer.avatar) customer.avatar = avatar;
              await customer.save();
            }
          }

          // 3. إنشاء حساب عميل جديد إذا لم يكن موجوداً
          if (!customer) {
            customer = await Customer.create({
              id: `cust_g_${Date.now()}`,
              name,
              email,
              googleId,
              provider: 'google',
              role: 'customer',
              avatar,
              ordersCount: 0,
              totalSpent: 0,
            });
          }

          return done(null, customer);
        } catch (error) {
          console.error('[Passport Google Strategy Error]', error.message);
          return done(error, null);
        }
      }
    )
  );

  // Passport serialization (for session-less JWT flow, minimal usage)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const customer = await Customer.findOne({ id });
      done(null, customer);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configurePassport;
