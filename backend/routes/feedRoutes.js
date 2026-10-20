/**
 * backend/routes/feedRoutes.js
 * مسار كتالوج المنتجات الديناميكي (Dynamic Product Feed)
 * متوافق مع Meta Commerce Manager (Facebook/Instagram) و Google Merchant Center
 */

const express = require('express');
const router = express.Router();
const jsonCache = require('../services/jsonCache');

router.get('/products', async (req, res) => {
  try {
    const products = await jsonCache.read('products.json', []);
    const clientUrl = process.env.CLIENT_URL || 'https://amazonfurniture.eg';

    // دعم استرجاع الـ Feed بصيغة JSON إذا طُلب ذلك عبر query ?format=json
    if (req.query.format === 'json') {
      return res.json({
        success: true,
        count: products.length,
        products: products.map((p) => ({
          id: p.id,
          title: p.name,
          description: p.description || p.name,
          availability: p.inStock !== false ? 'in stock' : 'out of stock',
          condition: 'new',
          price: `${p.price} EGP`,
          link: `${clientUrl}/products/${p.slug || p.id}`,
          image_link: Array.isArray(p.images) && p.images[0] ? p.images[0] : `${clientUrl}/opengraph-image.png`,
          brand: 'AMAZON',
          category: p.category || 'Furniture',
        })),
      });
    }

    // بناء XML Feed رسمي متوافق مع معايير Google Shopping و Meta Business Suite
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>AMAZON Products Catalog</title>\n`;
    xml += `    <link>${clientUrl}</link>\n`;
    xml += `    <description>كتالوج منتجات AMAZON – Premium Living Solutions المحدث لحظياً للمبيعات والإعلانات</description>\n`;

    for (const p of products) {
      const pId = p.id || p._id || `prod_${Date.now()}`;
      const pName = p.name || 'قطعة أثاث فاخرة';
      const pDesc = p.description || pName;
      const pLink = `${clientUrl}/products/${p.slug || pId}`;
      const pImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800';
      const pPrice = `${Number(p.price || 0).toFixed(2)} EGP`;
      const pAvailability = p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0) ? 'in_stock' : 'out_of_stock';
      const pCategory = p.category || 'Furniture';

      xml += `    <item>\n`;
      xml += `      <g:id>${pId}</g:id>\n`;
      xml += `      <g:title><![CDATA[${pName}]]></g:title>\n`;
      xml += `      <g:description><![CDATA[${pDesc}]]></g:description>\n`;
      xml += `      <g:link>${pLink}</g:link>\n`;
      xml += `      <g:image_link>${pImg}</g:image_link>\n`;
      xml += `      <g:brand>AMAZON</g:brand>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:availability>${pAvailability}</g:availability>\n`;
      xml += `      <g:price>${pPrice}</g:price>\n`;
      if (p.originalPrice && p.originalPrice > p.price) {
        xml += `      <g:sale_price>${pPrice}</g:sale_price>\n`;
      }
      xml += `      <g:google_product_category>Home &amp; Garden &gt; Furniture</g:google_product_category>\n`;
      xml += `      <g:product_type><![CDATA[${pCategory}]]></g:product_type>\n`;
      xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('GET /api/feed/products error:', err);
    return res.status(500).json({ error: 'Failed to generate product feed' });
  }
});

module.exports = router;
