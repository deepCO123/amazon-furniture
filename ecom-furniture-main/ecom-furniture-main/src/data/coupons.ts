export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderTotal: number;
  maxDiscount?: number;
  descriptionAr: string;
  descriptionEn: string;
}

export const ACTIVE_COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderTotal: 3000,
    maxDiscount: 2500,
    descriptionAr: "خصم 10% ترحيبي للعملاء الجدد (بحد أقصى 2,500 ج)",
    descriptionEn: "10% Welcome discount (up to 2,500 EGP)",
  },
  {
    code: "VIP2026",
    discountType: "percentage",
    discountValue: 15,
    minOrderTotal: 25000,
    maxDiscount: 6000,
    descriptionAr: "خصم 15% VIP للطلبات الكبرى فوق 25,000 ج",
    descriptionEn: "15% VIP discount on orders above 25,000 EGP",
  },
  {
    code: "AMAZON500",
    discountType: "fixed",
    discountValue: 500,
    minOrderTotal: 3500,
    descriptionAr: "قسيمة خصم فوري بقيمة 500 جنيه",
    descriptionEn: "500 EGP instant store voucher",
  },
];

export function validateCoupon(
  code: string,
  orderTotal: number
): {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
} {
  const norm = (code || "").trim().toUpperCase();
  const c = ACTIVE_COUPONS.find((cp) => cp.code === norm);

  if (!c) {
    return {
      valid: false,
      discountAmount: 0,
      message: "كود الخصم غير صحيح أو منتهي الصلاحية",
    };
  }

  if (orderTotal < c.minOrderTotal) {
    return {
      valid: false,
      discountAmount: 0,
      message: `هذا الكوبون يتطلب مشتريات بقيمة ${c.minOrderTotal.toLocaleString()} ج على الأقل`,
    };
  }

  let discount = 0;
  if (c.discountType === "percentage") {
    discount = (orderTotal * c.discountValue) / 100;
    if (c.maxDiscount && discount > c.maxDiscount) {
      discount = c.maxDiscount;
    }
  } else {
    discount = c.discountValue;
  }

  return {
    valid: true,
    coupon: c,
    discountAmount: Math.round(discount),
    message: `تم تفعيل الكوبون: ${c.descriptionAr}`,
  };
}
