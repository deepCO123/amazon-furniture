/**
 * backend/controllers/analyticsController.js
 * Returns Intelligence & Inventory Analytics Controller
 * 
 * المزايا الهندسية:
 * 1. خط أنابيب تجميع بيانات متقدم (MongoDB Aggregation Pipeline) يدمج المنتجات والمبيعات والمرتجعات.
 * 2. حساب معدل الإرجاع (Return Rate %) = (إجمالي المرتجع / إجمالي المبيعات) * 100 لكل منتج.
 * 3. تصنيف المنتجات كـ High Risk إذا تجاوز معدل الإرجاع 15%.
 * 4. تحليل وتحديد أسباب الإرجاع الأكثر تكراراً (Return Reasons Breakdown).
 * 5. محرك هجين (Hybrid Fallback Engine) يعمل مع MongoDB أو الذاكرة المخبأة (RAM Cache) لضمان التوفر 100%.
 */

const mongoose = require('mongoose');
const { Product, Order, Return } = require('../models');
const jsonCache = require('../services/jsonCache');

// خريطة مسميات أسباب الإرجاع بالعربية والإنجليزية
const REASON_LABELS = {
  defect: { en: 'Defect', ar: 'عيب تصنيع' },
  size_mismatch: { en: 'Size Mismatch', ar: 'عدم تطابق المقاس' },
  shipping_damage: { en: 'Shipping Damage', ar: 'تلف أثناء الشحن' },
  not_as_described: { en: 'Not as Described', ar: 'غير مطابق للوصف' },
  changed_mind: { en: 'Changed Mind', ar: 'تراجع عن الشراء' },
  quality_issue: { en: 'Quality Issue', ar: 'جودة أقل من المتوقع' },
  color_mismatch: { en: 'Color Mismatch', ar: 'اختلاف اللون عن المعروض' },
  other: { en: 'Other', ar: 'أسباب أخرى' },
};

function formatReason(rawReason) {
  const key = String(rawReason || 'other').toLowerCase().trim();
  return REASON_LABELS[key] || { en: rawReason || 'Other', ar: rawReason || 'أخرى' };
}

/**
 * بناء خط تجميع MongoDB الرسمي لدمج المنتجات والمبيعات والمرتجعات
 */
function buildAggregationPipeline() {
  return [
    // 1. جلب بيانات المبيعات من الطلبات غير الملغاة
    {
      $lookup: {
        from: 'orders',
        let: { productIdStr: '$id' },
        pipeline: [
          { $match: { status: { $ne: 'cancelled' } } },
          { $unwind: '$items' },
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$items.product.id', '$$productIdStr'] },
                  { $eq: [{ $toString: '$items.product.id' }, { $toString: '$$productIdStr' }] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSold: { $sum: { $ifNull: ['$items.quantity', 1] } },
              totalRevenue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ['$items.quantity', 1] },
                    { $ifNull: ['$items.product.price', 0] },
                  ],
                },
              },
            },
          },
        ],
        as: 'salesData',
      },
    },

    // 2. دمج بيانات المرتجعات غير المرفوضة
    {
      $lookup: {
        from: 'returns',
        let: { productIdStr: '$id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $or: [
                      { $eq: ['$productId', '$$productIdStr'] },
                      { $eq: [{ $toString: '$productId' }, { $toString: '$$productIdStr' }] },
                    ],
                  },
                  { $ne: ['$status', 'rejected'] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$reason',
              count: { $sum: 1 },
              totalRefund: { $sum: { $ifNull: ['$refundAmount', '$price'] } },
            },
          },
        ],
        as: 'returnReasons',
      },
    },

    // 3. إسقاط الحقول وتجهيز الحسابات الأولية
    {
      $project: {
        id: 1,
        name: 1,
        category: 1,
        price: 1,
        images: 1,
        stockQuantity: 1,
        totalSold: {
          $ifNull: [{ $arrayElemAt: ['$salesData.totalSold', 0] }, 0],
        },
        totalRevenue: {
          $ifNull: [{ $arrayElemAt: ['$salesData.totalRevenue', 0] }, 0],
        },
        totalReturned: {
          $reduce: {
            input: '$returnReasons',
            initialValue: 0,
            in: { $add: ['$$value', '$$this.count'] },
          },
        },
        totalLoss: {
          $reduce: {
            input: '$returnReasons',
            initialValue: 0,
            in: { $add: ['$$value', '$$this.totalRefund'] },
          },
        },
        returnReasons: 1,
      },
    },

    // 4. حساب نسبة الاسترجاع وتحديد High Risk
    {
      $addFields: {
        returnRate: {
          $cond: [
            { $gt: ['$totalSold', 0] },
            {
              $round: [
                {
                  $multiply: [{ $divide: ['$totalReturned', '$totalSold'] }, 100],
                },
                2,
              ],
            },
            {
              $cond: [{ $gt: ['$totalReturned', 0] }, 100, 0],
            },
          ],
        },
      },
    },

    // 5. تعيين مؤشرات الخطورة ومستويات التدخل
    {
      $addFields: {
        isHighRisk: { $gt: ['$returnRate', 15] },
        riskLevel: {
          $cond: [
            { $gt: ['$returnRate', 25] },
            'Critical',
            {
              $cond: [
                { $gt: ['$returnRate', 15] },
                'High Risk',
                {
                  $cond: [{ $gt: ['$returnRate', 5] }, 'Medium', 'Low'],
                },
              ],
            },
          ],
        },
      },
    },

    // 6. الترتيب حسب نسبة المرتجع التنازلية
    {
      $sort: { returnRate: -1, totalReturned: -1, totalSold: -1 },
    },
  ];
}

/**
 * حساب إحصائيات الذكاء الاصطناعي للمرتجعات في الذاكرة (Hybrid Fallback Engine)
 * يُستخدم عند تشغيل السيرفر بدون اتصال مباشر بـ MongoDB لضمان استمرارية لوحة الإدارة بنسبة 100%
 */
async function computeInMemoryAnalytics() {
  const [products, orders, returns] = await Promise.all([
    jsonCache.read('products.json', []),
    jsonCache.read('orders.json', []),
    jsonCache.read('returns.json', []),
  ]);

  // 1. خريطة مبيعات كل منتج من واقع الطلبات غير الملغاة
  const salesMap = new Map();
  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    if (!Array.isArray(order.items)) continue;

    for (const item of order.items) {
      const pId = String(item.product?.id || item.productId || '');
      if (!pId) continue;

      const current = salesMap.get(pId) || { totalSold: 0, totalRevenue: 0 };
      const qty = Number(item.quantity) || 1;
      const price = Number(item.product?.price || item.price || 0);

      current.totalSold += qty;
      current.totalRevenue += qty * price;
      salesMap.set(pId, current);
    }
  }

  // 2. خريطة المرتجعات لكل منتج
  const returnsMap = new Map();
  for (const ret of returns) {
    if (ret.status === 'rejected') continue;
    const pId = String(ret.productId || '');
    if (!pId) continue;

    const current = returnsMap.get(pId) || {
      count: 0,
      totalLoss: 0,
      reasons: new Map(),
    };

    current.count += 1;
    current.totalLoss += Number(ret.refundAmount || ret.price || 0);

    const reason = String(ret.reason || 'other').toLowerCase();
    current.reasons.set(reason, (current.reasons.get(reason) || 0) + 1);

    returnsMap.set(pId, current);
  }

  // 3. دمج البيانات لكل منتج وحساب المقاييس الدقيقة
  const analyzedProducts = products.map((prod) => {
    const pId = String(prod.id);
    const sales = salesMap.get(pId) || { totalSold: 0, totalRevenue: 0 };
    const ret = returnsMap.get(pId) || { count: 0, totalLoss: 0, reasons: new Map() };

    const totalSold = sales.totalSold;
    const totalReturned = ret.count;
    const totalLoss = ret.totalLoss;

    let returnRate = 0;
    if (totalSold > 0) {
      returnRate = Number(((totalReturned / totalSold) * 100).toFixed(2));
    } else if (totalReturned > 0) {
      returnRate = 100;
    }

    const isHighRisk = returnRate > 15;
    let riskLevel = 'Low';
    if (returnRate > 25) riskLevel = 'Critical';
    else if (returnRate > 15) riskLevel = 'High Risk';
    else if (returnRate > 5) riskLevel = 'Medium';

    // تحويل أسباب الإرجاع لمصفوفة مصنفة تنازلياً
    const returnReasonsArray = Array.from(ret.reasons.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        ...formatReason(reason),
      }))
      .sort((a, b) => b.count - a.count);

    const topReason = returnReasonsArray[0]?.en || 'None';

    return {
      id: prod.id,
      name: prod.name,
      category: prod.category || 'عام',
      price: Number(prod.price) || 0,
      images: prod.images || [],
      stockQuantity: Number(prod.stockQuantity) || 0,
      totalSold,
      totalRevenue: sales.totalRevenue,
      totalReturned,
      totalLoss,
      returnRate,
      isHighRisk,
      riskLevel,
      topReturnReason: topReason,
      returnReasons: returnReasonsArray,
    };
  });

  analyzedProducts.sort((a, b) => b.returnRate - a.returnRate || b.totalReturned - a.totalReturned);
  return analyzedProducts;
}

/**
 * @controller  getReturnsIntelligence
 * @route       GET /api/admin/analytics/returns-intelligence
 * @desc        جلب مؤشرات ذكاء المرتجعات، تصنيف المنتجات الخطرة، وتوزيع أسباب المرتجعات
 * @access      Private (Admin Only)
 */
exports.getReturnsIntelligence = async (req, res) => {
  try {
    let productsAnalysis = [];

    // التحقق من اتصال قاعدة بيانات MongoDB
    if (jsonCache.isMongoConnected()) {
      try {
        const pipeline = buildAggregationPipeline();
        const rawResults = await Product.aggregate(pipeline);

        productsAnalysis = rawResults.map((p) => {
          // تنسيق أسباب الاسترجاع
          const reasonsArray = (p.returnReasons || [])
            .map((r) => ({
              reason: r._id,
              count: r.count,
              ...formatReason(r._id),
            }))
            .sort((a, b) => b.count - a.count);

          return {
            ...p,
            topReturnReason: reasonsArray[0]?.en || 'None',
            returnReasons: reasonsArray,
          };
        });
      } catch (aggErr) {
        console.warn('[Analytics Aggregation Notice] Mongo aggregation fallback to memory:', aggErr.message);
        productsAnalysis = await computeInMemoryAnalytics();
      }
    } else {
      // الاعتماد على المحرك في الذاكرة في حال العمل بـ RAM fallback
      productsAnalysis = await computeInMemoryAnalytics();
    }

    // ─── حساب الإحصائيات العامة الشاملة (Summary KPIs) ───────────
    let totalFinancialLoss = 0;
    let totalUnitsSold = 0;
    let totalUnitsReturned = 0;
    let highRiskCount = 0;
    const globalReasonsMap = new Map();

    for (const p of productsAnalysis) {
      totalFinancialLoss += p.totalLoss || 0;
      totalUnitsSold += p.totalSold || 0;
      totalUnitsReturned += p.totalReturned || 0;
      if (p.isHighRisk) highRiskCount += 1;

      if (Array.isArray(p.returnReasons)) {
        for (const r of p.returnReasons) {
          const reasonKey = r.reason || 'other';
          const currentCount = globalReasonsMap.get(reasonKey) || 0;
          globalReasonsMap.set(reasonKey, currentCount + r.count);
        }
      }
    }

    // متوسط معدل الإرجاع على مستوى المتجر ككل
    const averageReturnRate = totalUnitsSold > 0
      ? Number(((totalUnitsReturned / totalUnitsSold) * 100).toFixed(2))
      : 0;

    // تجهيز توزيع أسباب الإرجاع للرسم البياني (Bar Chart Distribution)
    const reasonsDistribution = Array.from(globalReasonsMap.entries())
      .map(([reason, count]) => {
        const info = formatReason(reason);
        const percentage = totalUnitsReturned > 0
          ? Number(((count / totalUnitsReturned) * 100).toFixed(1))
          : 0;
        return {
          reason: info.en,
          reasonKey: reason,
          labelAr: info.ar,
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalFinancialLoss,
        averageReturnRate,
        totalUnitsSold,
        totalUnitsReturned,
        highRiskProductsCount: highRiskCount,
        totalProductsAnalyzed: productsAnalysis.length,
      },
      reasonsDistribution,
      products: productsAnalysis,
    });
  } catch (error) {
    console.error('Returns Intelligence Analytics Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to compute returns intelligence analytics',
      details: error.message,
    });
  }
};
