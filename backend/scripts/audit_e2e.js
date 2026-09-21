/**
 * backend/scripts/audit_e2e.js
 * Comprehensive End-to-End (E2E) Integration Audit Script
 * Verifies Mongoose transforms, Hybrid RAM Cache, Auth/RBAC, and User Journeys.
 */

const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const models = require('../models');
const jsonCache = require('../services/jsonCache');

const BASE_URL = 'http://localhost:5000';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Helper to make HTTP requests
function httpRequest(endpoint, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const startTime = Date.now();
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch {
          parsed = data;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          duration,
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Extract token cookie from response headers
function extractTokenCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = cookieStr.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

async function runAudit() {
  console.log('=============================================================');
  console.log('  STARTING COMPREHENSIVE E2E INTEGRATION AUDIT');
  console.log('=============================================================\n');

  // =========================================================================
  // 1. DATA CONTRACT & MONGOOSE TRANSFORM VERIFICATION
  // =========================================================================
  console.log('=== Step 1: Data Contract & Mongoose Transform Verification ===');

  const testData = {
    Product: {
      id: 'test_p1',
      name: 'كرسي أرجوحة مودرن',
      slug: 'modern-swing-chair',
      price: 2500,
      category: 'living-room',
      stockQuantity: 5,
    },
    Customer: {
      id: 'test_c1',
      name: 'أحمد محمود',
      email: 'ahmed.audit@example.com',
    },
    Order: {
      id: 'test_o1',
      customerName: 'أحمد محمود',
      customerEmail: 'ahmed.audit@example.com',
      total: 2500,
      status: 'processing',
      items: [
        {
          product: {
            id: 'test_p1',
            name: 'كرسي أرجوحة مودرن',
            price: 2500,
            category: 'living-room',
            slug: 'modern-swing-chair',
          },
          quantity: 1,
        },
      ],
    },
    Quotation: {
      id: 'test_q1',
      customerName: 'شركة النيل للتقنية',
      companyName: 'NileTech',
      total: 45000,
    },
    Return: {
      id: 'test_r1',
      orderId: 'test_o1',
      customerName: 'أحمد محمود',
      productName: 'كرسي أرجوحة مودرن',
      refundAmount: 2500,
    },
    Consultation: {
      id: 'test_con1',
      fullName: 'سارة إبراهيم',
      phone: '01012345678',
      consultType: 'mansoura',
    },
    Email: {
      id: 'test_em1',
      to: 'ahmed.audit@example.com',
      subject: 'تأكيد الطلب رقم test_o1',
      type: 'ORDER_CONFIRMATION',
    },
  };

  for (const [modelName, sampleData] of Object.entries(testData)) {
    const Model = models[modelName];
    assert(Boolean(Model), `Model ${modelName} is exported and defined`);

    const doc = new Model(sampleData);
    const json = doc.toJSON();

    assert(Boolean(json.id), `${modelName} toJSON() preserves/exposes 'id' (${json.id})`);
    assert(json._id === undefined, `${modelName} toJSON() strips '_id'`);
    assert(json.__v === undefined, `${modelName} toJSON() strips '__v'`);
  }

  // Also test case where doc has _id without initial id
  const rawDoc = new models.Product({
    name: 'مكتب خشب زان',
    slug: 'zan-wood-desk',
    price: 3200,
    category: 'office',
    stockQuantity: 3,
  });
  const rawJson = rawDoc.toJSON();
  assert(Boolean(rawJson.id), `Document without initial id gets id mapped from _id (${rawJson.id})`);
  assert(rawJson._id === undefined, `Document strips _id properly`);
  assert(rawJson.__v === undefined, `Document strips __v properly`);

  console.log('✓ Step 1 Completed Successfully.\n');

  // =========================================================================
  // 2. AUTHENTICATION & RBAC ROUTE GUARDING VERIFICATION
  // =========================================================================
  console.log('=== Step 2: Authentication & RBAC Route Guarding Verification ===');

  // 2.1 Unauthorized mutations must return 401
  const mutatingEndpoints = [
    { method: 'POST', path: '/api/products', body: { name: 'Hack Prod', price: 10, category: 'living' } },
    { method: 'PUT', path: '/api/products', body: { id: 'prod_1', name: 'Hacked' } },
    { method: 'DELETE', path: '/api/products?id=prod_1' },
    { method: 'GET', path: '/api/orders' },
    { method: 'PATCH', path: '/api/orders', body: { orderId: 'AF-100', status: 'shipped' } },
    { method: 'DELETE', path: '/api/orders?id=AF-100' },
    { method: 'DELETE', path: '/api/quotations?id=q_1' },
    { method: 'PATCH', path: '/api/returns', body: { returnId: 'ret_1', status: 'approved' } },
    { method: 'PATCH', path: '/api/consultations', body: { id: 'c_1', status: 'completed' } },
    { method: 'GET', path: '/api/cache-stats' },
    { method: 'GET', path: '/api/admin/dashboard' },
  ];

  for (const ep of mutatingEndpoints) {
    const res = await httpRequest(ep.path, { method: ep.method }, ep.body);
    assert(
      res.statusCode === 401,
      `Unauthorized ${ep.method} ${ep.path} rejected with 401 Unauthorized (got ${res.statusCode})`
    );
  }

  // 2.2 Admin Login
  const adminRes = await httpRequest('/api/auth/admin-login', { method: 'POST' }, {
    email: 'admin@amazonfurniture.eg',
    password: 'Admin@Pass2026!',
  });
  assert(adminRes.statusCode === 200, 'Admin login succeeded with status 200');
  assert(adminRes.data.success === true, 'Admin login returns success: true');
  assert(adminRes.data.user.role === 'admin', 'Admin user role is "admin"');

  const adminToken = extractTokenCookie(adminRes.headers);
  assert(Boolean(adminToken), 'Admin login generated HttpOnly JWT cookie in Set-Cookie header');

  const adminCookieHeader = `token=${adminToken}`;

  // 2.3 Verify Admin Session via /api/auth/me
  const meRes = await httpRequest('/api/auth/me', {
    method: 'GET',
    headers: { Cookie: adminCookieHeader },
  });
  assert(meRes.statusCode === 200, 'Admin session authenticated via /api/auth/me');
  assert(meRes.data.user.email === 'admin@amazonfurniture.eg', 'Current user email matches admin');

  // 2.4 Verify Admin access to /api/admin/dashboard
  const dashRes = await httpRequest('/api/admin/dashboard', {
    method: 'GET',
    headers: { Cookie: adminCookieHeader },
  });
  assert(dashRes.statusCode === 200, 'Admin allowed to access /api/admin/dashboard');

  console.log('✓ Step 2 Completed Successfully.\n');

  // =========================================================================
  // 3. HYBRID RAM CACHE & CRUD SYNCHRONIZATION
  // =========================================================================
  console.log('=== Step 3: Hybrid RAM Cache & CRUD Synchronization ===');

  // 3.1 Initial GET /api/products
  const initialGet = await httpRequest('/api/products');
  assert(initialGet.statusCode === 200, 'GET /api/products returned 200 OK');
  assert(Array.isArray(initialGet.data), 'GET /api/products returned an array of products');
  const initialCount = initialGet.data.length;
  console.log(`    Initial product count in RAM Cache: ${initialCount}`);

  // Subsequent GET to test 0ms In-Memory RAM Cache hit
  const cachedGet = await httpRequest('/api/products');
  assert(cachedGet.statusCode === 200, 'Subsequent GET /api/products returned 200 OK');
  console.log(`    Subsequent GET response time: ${cachedGet.duration}ms (RAM Cache Hit)`);

  // 3.2 CREATE: POST /api/products with Admin Token
  const testProductPayload = {
    id: `audit_prod_${Date.now()}`,
    name: 'طاولة طعام فاخرة 8 كراسي أوديت',
    slug: `luxury-dining-table-audit-${Date.now().toString().slice(-4)}`,
    description: 'خشب زان طبيعي مع تشطيب إيطالي فاخر تم تصنيعها لأغراض التدقيق',
    price: 38500,
    originalPrice: 42000,
    category: 'dining-room',
    stockQuantity: 7,
    rating: 5,
    reviewCount: 4,
    inStock: true,
    tags: ['dining-room', 'luxury', 'audit'],
  };

  const createProdRes = await httpRequest(
    '/api/products',
    {
      method: 'POST',
      headers: { Cookie: adminCookieHeader },
    },
    testProductPayload
  );
  assert(createProdRes.statusCode === 201, 'POST /api/products created product with 201 Created');
  assert(createProdRes.data.id === testProductPayload.id, 'Created product returns correct id');

  // 3.3 READ: Verify RAM Cache is instantly updated
  const postCreateGet = await httpRequest('/api/products');
  assert(postCreateGet.data.length === initialCount + 1, 'RAM Cache instantly updated with +1 product');
  const foundCreated = postCreateGet.data.find((p) => p.id === testProductPayload.id);
  assert(Boolean(foundCreated), 'Newly created product immediately retrievable from RAM Cache');
  assert(foundCreated.price === 38500, 'Product details in RAM Cache match creation payload');

  // 3.4 UPDATE: PUT /api/products
  const updateProdPayload = {
    id: testProductPayload.id,
    price: 36000,
    description: 'تم تحديث السعر والوصف للتأكد من التزامن الفوري للرامات',
  };

  const updateProdRes = await httpRequest(
    '/api/products',
    {
      method: 'PUT',
      headers: { Cookie: adminCookieHeader },
    },
    updateProdPayload
  );
  assert(updateProdRes.statusCode === 200, 'PUT /api/products updated product with 200 OK');
  assert(updateProdRes.data.price === 36000, 'Updated response reflects new price 36000');

  // Verify RAM Cache has updated item
  const postUpdateGet = await httpRequest('/api/products');
  const foundUpdated = postUpdateGet.data.find((p) => p.id === testProductPayload.id);
  assert(foundUpdated && foundUpdated.price === 36000, 'Updated product in RAM Cache immediately has new price');

  // 3.5 DELETE: DELETE /api/products
  const deleteProdRes = await httpRequest(
    `/api/products?id=${testProductPayload.id}`,
    {
      method: 'DELETE',
      headers: { Cookie: adminCookieHeader },
    }
  );
  assert(deleteProdRes.statusCode === 200, 'DELETE /api/products returned 200 OK');
  assert(deleteProdRes.data.success === true, 'DELETE response success: true');

  // Verify RAM Cache immediately evicted item
  const postDeleteGet = await httpRequest('/api/products');
  assert(postDeleteGet.data.length === initialCount, 'Product count in RAM Cache restored to initial count');
  assert(!postDeleteGet.data.some((p) => p.id === testProductPayload.id), 'Deleted product absent from RAM Cache');

  console.log('✓ Step 3 Completed Successfully.\n');

  // =========================================================================
  // 4. FULL USER JOURNEY SIMULATION (CUSTOMER & ADMIN)
  // =========================================================================
  console.log('=== Step 4: Full User Journey Simulation ===');

  // 4.1 Customer Registration & Login
  const customerEmail = `e2e.customer.${Date.now()}@test.com`;
  const customerPassword = 'SecurePassword2026!';
  const customerName = 'م. عمر الشريف';

  const custRegisterRes = await httpRequest(
    '/api/auth/customer-login',
    { method: 'POST' },
    {
      email: customerEmail,
      password: customerPassword,
      name: customerName,
    }
  );
  assert(
    custRegisterRes.statusCode === 201 || custRegisterRes.statusCode === 200,
    'Customer registration succeeded with status 201/200'
  );
  assert(custRegisterRes.data.user.email === customerEmail, 'Customer registered with correct email');
  assert(custRegisterRes.data.user.role === 'customer', 'Customer role is "customer"');

  const customerToken = extractTokenCookie(custRegisterRes.headers);
  assert(Boolean(customerToken), 'Customer received HttpOnly JWT cookie');
  const customerCookieHeader = `token=${customerToken}`;

  // 4.2 Customer Browses Products
  const catalogRes = await httpRequest('/api/products');
  assert(catalogRes.statusCode === 200 && catalogRes.data.length > 0, 'Customer successfully browsed products catalog');
  const targetProduct = catalogRes.data[0];
  const initialStock = targetProduct.stockQuantity ?? 10;
  console.log(`    Selected product: "${targetProduct.name}" (ID: ${targetProduct.id}), Current Stock: ${initialStock}`);

  // 4.3 Customer Checkout Order
  const orderQuantity = 2;
  const testOrderId = `AF-AUDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderPayload = {
    id: testOrderId,
    userId: custRegisterRes.data.user.id,
    customerName,
    customerEmail,
    customerPhone: '01099887766',
    items: [
      {
        product: {
          id: targetProduct.id,
          name: targetProduct.name,
          price: targetProduct.price,
          images: targetProduct.images || [],
          category: targetProduct.category,
          slug: targetProduct.slug,
        },
        quantity: orderQuantity,
        color: 'بيج فاتح',
      },
    ],
    total: targetProduct.price * orderQuantity,
    shippingAddress: {
      firstName: customerName,
      email: customerEmail,
      phone: '01099887766',
      address: 'شارع المشاية، برج النيل، المنصورة',
      city: 'المنصورة',
    },
    notes: 'يرجى المعاينة والتسليم بعد الساعة 5 مساءً',
  };

  const createOrderRes = await httpRequest(
    '/api/orders',
    {
      method: 'POST',
      headers: { Cookie: customerCookieHeader },
    },
    orderPayload
  );
  assert(createOrderRes.statusCode === 201, 'Customer placed order successfully with 201 Created');
  assert(createOrderRes.data.success === true, 'Order creation returned success: true');
  assert(createOrderRes.data.orderId === testOrderId, 'Returned orderId matches placed orderId');

  // 4.4 Verify Stock Deduction in Products RAM Cache
  const postOrderProducts = await httpRequest('/api/products');
  const orderedProductInCache = postOrderProducts.data.find((p) => p.id === targetProduct.id);
  assert(
    orderedProductInCache.stockQuantity === Math.max(0, initialStock - orderQuantity),
    `Product stock in RAM Cache decremented by ${orderQuantity} (from ${initialStock} to ${orderedProductInCache.stockQuantity})`
  );

  // 4.5 Admin Journey: Admin Views Orders
  const adminOrdersRes = await httpRequest('/api/orders', {
    method: 'GET',
    headers: { Cookie: adminCookieHeader },
  });
  assert(adminOrdersRes.statusCode === 200, 'Admin successfully fetched all orders via /api/orders');
  const foundOrderInList = adminOrdersRes.data.find((o) => o.id === testOrderId);
  assert(Boolean(foundOrderInList), 'Newly placed customer order is visible in Admin orders list');
  assert(foundOrderInList.customerEmail === customerEmail, 'Order has correct customerEmail');
  assert(foundOrderInList.status === 'processing', 'Initial order status is "processing"');

  // 4.6 Admin Journey: Admin Updates Order Status (PATCH)
  const patchOrderRes = await httpRequest(
    '/api/orders',
    {
      method: 'PATCH',
      headers: { Cookie: adminCookieHeader },
    },
    {
      orderId: testOrderId,
      status: 'manufacturing',
    }
  );
  assert(patchOrderRes.statusCode === 200, 'Admin updated order status to "manufacturing" with 200 OK');
  assert(patchOrderRes.data.order.status === 'manufacturing', 'Patched order status is "manufacturing"');

  // Verify Admin Orders List reflects update instantly in RAM Cache
  const adminOrdersAfterPatch = await httpRequest('/api/orders', {
    method: 'GET',
    headers: { Cookie: adminCookieHeader },
  });
  const updatedOrderInList = adminOrdersAfterPatch.data.find((o) => o.id === testOrderId);
  assert(updatedOrderInList.status === 'manufacturing', 'Admin orders list reflects "manufacturing" status immediately');

  // 4.7 Clean up: Admin Deletes Test Order & Restores Product Stock
  const deleteOrderRes = await httpRequest(
    `/api/orders?id=${testOrderId}`,
    {
      method: 'DELETE',
      headers: { Cookie: adminCookieHeader },
    }
  );
  assert(deleteOrderRes.statusCode === 200, 'Admin deleted test order successfully');

  // Restore product stock
  const allProds = await jsonCache.read('products.json', []);
  const pIdx = allProds.findIndex((p) => p.id === targetProduct.id);
  if (pIdx !== -1) {
    allProds[pIdx].stockQuantity = initialStock;
    await jsonCache.write('products.json', allProds);
  }

  console.log('✓ Step 4 Completed Successfully.\n');

  // =========================================================================
  // 5. CACHE STATS & METRICS VERIFICATION
  // =========================================================================
  console.log('=== Step 5: Cache Performance & Metrics Verification ===');

  const statsRes = await httpRequest('/api/cache-stats', {
    method: 'GET',
    headers: { Cookie: adminCookieHeader },
  });
  assert(statsRes.statusCode === 200, 'GET /api/cache-stats returned 200 OK');
  assert(statsRes.data.success === true, 'Cache stats success: true');
  assert(statsRes.data.metrics.hits > 0, `RAM Cache hits recorded: ${statsRes.data.metrics.hits}`);
  assert(statsRes.data.metrics.writes > 0, `RAM Cache writes recorded: ${statsRes.data.metrics.writes}`);

  console.log('    Metrics Summary:', JSON.stringify(statsRes.data.metrics, null, 2));
  console.log('✓ Step 5 Completed Successfully.\n');

  console.log('=============================================================');
  console.log(`  AUDIT COMPLETE: All ${passedChecks}/${totalChecks} checks PASSED (100% HEALTH)`);
  console.log('=============================================================');
}

runAudit().catch((err) => {
  console.error('\n❌ AUDIT FAILED:', err);
  process.exit(1);
});
