/**
 * backend/services/invoiceService.js
 * خدمة إنشاء الفواتير الرسمية بصيغة PDF وتضمين شهادة الضمان لـ 10 سنوات
 * لشركة Amazon Furniture باستخدام PDFKit
 */

const PDFDocument = require('pdfkit');

/**
 * توليد ملف PDF للفاتورة وإرجاعه كـ Buffer في الذاكرة
 * @param {Object} order - كائن الطلب الكامل
 * @returns {Promise<Buffer>}
 */
function generateInvoiceBuffer(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `فاتورة ضريبية وشهادة ضمان - ${order.id}`,
          Author: 'Amazon Furniture Egypt',
          Subject: 'فاتورة رسمية وعقد ضمان الأخشاب الطبيعية لمدة 10 سنوات',
          Creator: 'Amazon Furniture ERP System',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // ─── 1. Header & Brand Identity ───────────────────────
      // Dark header banner
      doc
        .rect(0, 0, doc.page.width, 110)
        .fill('#1C1917');

      // Accent gold bottom line for banner
      doc
        .rect(0, 107, doc.page.width, 3)
        .fill('#C5A880');

      // Company Title & Tagline
      doc
        .fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('AMAZON FURNITURE', 45, 30);

      doc
        .fillColor('#C5A880')
        .fontSize(9)
        .font('Helvetica')
        .text('ESTABLISHED 1994 | LUXURY HANDCRAFTED FURNITURE', 45, 58)
        .text('Damietta & Mansoura Factories | Cairo Showrooms', 45, 72);

      // Invoice Badge / Order ID on Right
      doc
        .fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('OFFICIAL INVOICE', doc.page.width - 220, 30, { align: 'right', width: 175 })
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#C5A880')
        .text(`Order: #${order.id}`, doc.page.width - 220, 55, { align: 'right', width: 175 })
        .fillColor('#E2E8F0')
        .text(`Date: ${new Date(order.date || Date.now()).toLocaleDateString('en-GB')}`, doc.page.width - 220, 72, { align: 'right', width: 175 });

      doc.y = 135;

      // ─── 2. Customer & Delivery Info ─────────────────────
      const leftCol = 45;
      const rightCol = 310;
      const sectionY = 135;

      // Box 1: Billed To
      doc
        .rect(leftCol, sectionY, 245, 95)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      doc
        .fillColor('#0F172A')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('CUSTOMER DETAILS', leftCol + 15, sectionY + 12);

      const customerName = order.customerName || order.shippingAddress?.firstName || 'Valued Client';
      const customerPhone = order.customerPhone || order.shippingAddress?.phone || 'N/A';
      const customerEmail = order.customerEmail || order.shippingAddress?.email || 'N/A';

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`Name: ${customerName}`, leftCol + 15, sectionY + 32)
        .text(`Phone: ${customerPhone}`, leftCol + 15, sectionY + 48)
        .text(`Email: ${customerEmail}`, leftCol + 15, sectionY + 64)
        .text(`Status: Verified VIP Client`, leftCol + 15, sectionY + 80);

      // Box 2: Shipping Destination
      doc
        .rect(rightCol, sectionY, 245, 95)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      doc
        .fillColor('#0F172A')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('SHIPPING & INSTALLATION', rightCol + 15, sectionY + 12);

      const city = order.shippingAddress?.city || 'Mansoura / Cairo';
      const address = order.shippingAddress?.address || 'Direct Showroom Delivery';

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`City / Gov: ${city}`, rightCol + 15, sectionY + 32)
        .text(`Address: ${address.substring(0, 36)}`, rightCol + 15, sectionY + 48)
        .text('Assembly: Free Professional Assembly Included', rightCol + 15, sectionY + 64)
        .text('Shipping: Special Furniture Freight Delivery', rightCol + 15, sectionY + 80);

      // ─── 3. Items Table ──────────────────────────────────
      const tableTop = 250;
      doc
        .rect(leftCol, tableTop, 510, 24)
        .fill('#1C1917');

      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('ITEM DESCRIPTION', leftCol + 15, tableTop + 7)
        .text('QTY', 330, tableTop + 7, { width: 40, align: 'center' })
        .text('PRICE (EGP)', 380, tableTop + 7, { width: 80, align: 'right' })
        .text('TOTAL', 470, tableTop + 7, { width: 75, align: 'right' });

      let currentY = tableTop + 24;
      const items = Array.isArray(order.items) ? order.items : [];

      items.forEach((item, index) => {
        const prod = item.product || {};
        const title = prod.name || item.name || `Furniture Piece #${index + 1}`;
        const qty = item.quantity || 1;
        const unitPrice = Number(prod.price || item.price || 0);
        const lineTotal = qty * unitPrice;

        const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc
          .rect(leftCol, currentY, 510, 28)
          .fillAndStroke(rowBg, '#F1F5F9');

        doc
          .fillColor('#1E293B')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(title.substring(0, 45), leftCol + 15, currentY + 9, { width: 260 })
          .font('Helvetica')
          .text(String(qty), 330, currentY + 9, { width: 40, align: 'center' })
          .text(unitPrice.toLocaleString() + ' EGP', 380, currentY + 9, { width: 80, align: 'right' })
          .font('Helvetica-Bold')
          .text(lineTotal.toLocaleString() + ' EGP', 470, currentY + 9, { width: 75, align: 'right' });

        currentY += 28;
      });

      // ─── 4. Totals Summary ───────────────────────────────
      const summaryTop = currentY + 15;
      const subtotal = Number(order.total || 0);

      doc
        .rect(310, summaryTop, 245, 80)
        .fillAndStroke('#FAF5EF', '#C5A880');

      doc
        .fillColor('#1C1917')
        .fontSize(9)
        .font('Helvetica')
        .text('Subtotal:', 325, summaryTop + 12)
        .text(`${subtotal.toLocaleString()} EGP`, 450, summaryTop + 12, { width: 95, align: 'right' })
        .text('Professional Assembly:', 325, summaryTop + 28)
        .text('FREE (0 EGP)', 450, summaryTop + 28, { width: 95, align: 'right' })
        .text('Insured Shipping:', 325, summaryTop + 44)
        .text('FREE (0 EGP)', 450, summaryTop + 44, { width: 95, align: 'right' });

      doc
        .rect(310, summaryTop + 58, 245, 22)
        .fill('#1C1917');

      doc
        .fillColor('#C5A880')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL AMOUNT:', 325, summaryTop + 64)
        .fillColor('#FFFFFF')
        .text(`${subtotal.toLocaleString()} EGP`, 450, summaryTop + 64, { width: 95, align: 'right' });

      // ─── 5. Official 10-Year Warranty Certification ──────
      const warrantyTop = summaryTop + 95;

      doc
        .rect(leftCol, warrantyTop, 510, 110)
        .fillAndStroke('#FEF3C7', '#F59E0B');

      doc
        .fillColor('#92400E')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('10-YEAR OFFICIAL WOOD WARRANTY CERTIFICATE', leftCol + 15, warrantyTop + 12);

      doc
        .fillColor('#78350F')
        .fontSize(8.5)
        .font('Helvetica')
        .text(
          '1. Frame Integrity: 100% Seasoned Natural Romanian Red Beech wood chassis guaranteed against warping, cracking, or splitting for ten (10) consecutive calendar years from the date of delivery.',
          leftCol + 15,
          warrantyTop + 30,
          { width: 480 }
        )
        .text(
          '2. Hardware & Mechanisms: Turkish imported gas-lift mechanisms and soft-close hinges covered under a 3-year full replacement warranty.',
          leftCol + 15,
          warrantyTop + 55,
          { width: 480 }
        )
        .text(
          '3. Service Hotline: For warranty claims, maintenance, or inspections, contact our Quality Control Hotline at +20 109 1084863 with your Order ID.',
          leftCol + 15,
          warrantyTop + 75,
          { width: 480 }
        );

      // ─── 6. Footer & Signatures ──────────────────────────
      const footerY = 720;

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#64748B')
        .text('QUALITY ASSURANCE SEAL', leftCol + 40, footerY)
        .text('MANAGING DIRECTOR', 380, footerY);

      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#94A3B8')
        .text('Amazon Furniture Quality Control Unit', leftCol + 20, footerY + 14)
        .text('Mohamed Ismail - General Director', 360, footerY + 14);

      doc
        .rect(leftCol, 760, 510, 1)
        .fill('#E2E8F0');

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#64748B')
        .text(
          'Amazon Furniture Egypt | Factory: New Damietta Industrial Area | Mansoura Showroom: Talkha Main St. | Phone: +20 109 1084863',
          leftCol,
          770,
          { align: 'center', width: 510 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateInvoiceBuffer,
};
