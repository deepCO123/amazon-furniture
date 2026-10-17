export interface ShippingGovernorate {
  id: string;
  nameAr: string;
  nameEn: string;
  cost: number;
  deliveryDays: string;
  region: "greater_cairo" | "delta" | "canal" | "alexandria" | "upper_egypt" | "coastal";
}

export const FREE_SHIPPING_THRESHOLD = 25000; // 25,000 EGP for free shipping

export const EGYPT_GOVERNORATES: ShippingGovernorate[] = [
  { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo", cost: 150, deliveryDays: "2 - 3 أيام عمل", region: "greater_cairo" },
  { id: "giza", nameAr: "الجيزة", nameEn: "Giza", cost: 150, deliveryDays: "2 - 3 أيام عمل", region: "greater_cairo" },
  { id: "qalyubia", nameAr: "القليوبية", nameEn: "Qalyubia", cost: 200, deliveryDays: "3 - 4 أيام عمل", region: "greater_cairo" },
  { id: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria", cost: 300, deliveryDays: "3 - 5 أيام عمل", region: "alexandria" },
  { id: "beheira", nameAr: "البحيرة", nameEn: "Beheira", cost: 300, deliveryDays: "3 - 5 أيام عمل", region: "alexandria" },
  { id: "sharqia", nameAr: "الشرقية (الزقازيق / العاشر)", nameEn: "Sharqia", cost: 300, deliveryDays: "3 - 5 أيام عمل", region: "delta" },
  { id: "dakahlia", nameAr: "الدقهلية (المنصورة)", nameEn: "Dakahlia", cost: 350, deliveryDays: "4 - 5 أيام عمل", region: "delta" },
  { id: "gharbia", nameAr: "الغربية (طنطا / المحلة)", nameEn: "Gharbia", cost: 350, deliveryDays: "4 - 5 أيام عمل", region: "delta" },
  { id: "monufia", nameAr: "المنوفية (شبين الكوم)", nameEn: "Monufia", cost: 300, deliveryDays: "3 - 4 أيام عمل", region: "delta" },
  { id: "damietta", nameAr: "دمياط", nameEn: "Damietta", cost: 350, deliveryDays: "4 - 5 أيام عمل", region: "delta" },
  { id: "kafr_el_sheikh", nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh", cost: 350, deliveryDays: "4 - 5 أيام عمل", region: "delta" },
  { id: "ismailia", nameAr: "الإسماعيلية", nameEn: "Ismailia", cost: 350, deliveryDays: "3 - 5 أيام عمل", region: "canal" },
  { id: "port_said", nameAr: "بورسعيد", nameEn: "Port Said", cost: 350, deliveryDays: "3 - 5 أيام عمل", region: "canal" },
  { id: "suez", nameAr: "السويس", nameEn: "Suez", cost: 350, deliveryDays: "3 - 5 أيام عمل", region: "canal" },
  { id: "fayoum", nameAr: "الفيوم", nameEn: "Fayoum", cost: 400, deliveryDays: "4 - 6 أيام عمل", region: "upper_egypt" },
  { id: "beni_suef", nameAr: "بني سويف", nameEn: "Beni Suef", cost: 450, deliveryDays: "4 - 6 أيام عمل", region: "upper_egypt" },
  { id: "minya", nameAr: "المنيا", nameEn: "Minya", cost: 500, deliveryDays: "5 - 7 أيام عمل", region: "upper_egypt" },
  { id: "asyut", nameAr: "أسيوط", nameEn: "Asyut", cost: 550, deliveryDays: "5 - 7 أيام عمل", region: "upper_egypt" },
  { id: "sohag", nameAr: "سوهاج", nameEn: "Sohag", cost: 650, deliveryDays: "6 - 8 أيام عمل", region: "upper_egypt" },
  { id: "qena", nameAr: "قنا", nameEn: "Qena", cost: 700, deliveryDays: "6 - 8 أيام عمل", region: "upper_egypt" },
  { id: "luxor", nameAr: "الأقصر", nameEn: "Luxor", cost: 750, deliveryDays: "7 - 9 أيام عمل", region: "upper_egypt" },
  { id: "aswan", nameAr: "أسوان", nameEn: "Aswan", cost: 800, deliveryDays: "7 - 10 أيام عمل", region: "upper_egypt" },
  { id: "red_sea", nameAr: "البحر الأحمر (الغردقة / الجونة)", nameEn: "Red Sea (Hurghada)", cost: 750, deliveryDays: "5 - 8 أيام عمل", region: "coastal" },
  { id: "south_sinai", nameAr: "جنوب سيناء (شرم الشيخ / دهب)", nameEn: "South Sinai (Sharm)", cost: 850, deliveryDays: "6 - 9 أيام عمل", region: "coastal" },
  { id: "matrouh", nameAr: "مطروح والساحل الشمالي", nameEn: "Matrouh & North Coast", cost: 600, deliveryDays: "5 - 8 أيام عمل", region: "coastal" },
];

export function getShippingRate(governorateIdOrName: string, cartTotal: number): {
  cost: number;
  isFree: boolean;
  deliveryDays: string;
  governorateName: string;
} {
  const norm = (governorateIdOrName || "").trim().toLowerCase();
  const gov = EGYPT_GOVERNORATES.find(
    (g) =>
      g.id.toLowerCase() === norm ||
      g.nameAr.toLowerCase().includes(norm) ||
      norm.includes(g.nameAr.toLowerCase()) ||
      g.nameEn.toLowerCase() === norm
  ) || EGYPT_GOVERNORATES[0]; // default to Cairo

  const isFree = cartTotal >= FREE_SHIPPING_THRESHOLD;
  return {
    cost: isFree ? 0 : gov.cost,
    isFree,
    deliveryDays: gov.deliveryDays,
    governorateName: gov.nameAr,
  };
}
