import type { Review } from "@/types";

export const reviews: Review[] = [
  // 🇪🇬 عربي (مصري)
  {
    id: "1",
    productId: "1",
    author: "م. حسام الدين عبد الله",
    avatar: "HA",
    rating: 5,
    date: "2026-08-14",
    locale: "ar",
    location: "القاهرة الجديدة - التجمع",
    comment:
      "ما شاء الله الكرسي المكتبي الطبي خاماته ممتازة جداً والشاسيه الهيدروليك تقيل ومحترم.. قعدتي 8 ساعات متواصلة بدون أي وجع في الضهر أو الرقبة. شكراً أستاذ محمد إسماعيل على سرعة التوصيل والتركيب المجاني.",
  },
  {
    id: "2",
    productId: "3",
    author: "أحمد عبد الرازق",
    avatar: "AA",
    rating: 5,
    date: "2026-08-20",
    locale: "ar",
    location: "الجيزة - الدقي",
    comment:
      "المكتب خشب ميلامين مستورد محمل ومقاوم للخدش بشكل مذهل.. الفنش وتقفيل الحواف مظبوط بالمللي، والستائر الرول البلاك أوت اللي طلبتها معاهم عزلت الشمس والحرارة تماماً في المكتب.",
  },
  {
    id: "3",
    productId: "5",
    author: "د. نجلاء فهمي",
    avatar: "NF",
    rating: 5,
    date: "2026-09-02",
    locale: "ar",
    location: "الإسكندرية - سموحة",
    comment:
      "الركنة الجلدية المودرن فخمة للغاية وخشب الزان الطبيعي صلب ومتين، كل عميل بيدخل العيادة بيشكر في شياكة الاستقبال وجودة التنجيد. تعامل في قمة الذوق والأمانة.",
  },

  // 🇸🇦 سعودي (لهجة سعودية مميزة)
  {
    id: "4",
    productId: "2",
    author: "فيصل بن عبد العزيز المطيري",
    avatar: "FM",
    rating: 5,
    date: "2026-08-28",
    locale: "sa",
    location: "الرياض، المملكة العربية السعودية",
    comment:
      "يا هلا والله.. طلبت كرسي الجيمينج الاحترافي ووصلني الرياض في وقت قياسي والتغليف ممتاز.. مريح بشكل ما تتخيلونه للظهر ومساند اليدين تتعدل بكل الاتجاهات، خامة الجلد والحديد بطله وتستاهل كل ريال. بيض الله وجيهكم!",
  },
  {
    id: "5",
    productId: "6",
    author: "سلطان الشمري",
    avatar: "SS",
    rating: 5,
    date: "2026-09-05",
    locale: "sa",
    location: "جدة، المملكة العربية السعودية",
    comment:
      "أخذت منهم ستائر مكتبية زيبرا وكرسي طبي للمكتب المنزلي.. الشغل تبارك الرحمن فن وإتقان، عازلة للنور وتفتح النفس والتعامل مع الأستاذ محمد إسماعيل راقي جداً وأنصح الكل بالتعامل معهم وبقوة.",
  },
  {
    id: "6",
    productId: "4",
    author: "د. ريم القحطاني",
    avatar: "RQ",
    rating: 5,
    date: "2026-09-10",
    locale: "sa",
    location: "الدمام، المملكة العربية السعودية",
    comment:
      "الكرسي الطبي الإرجونوميك حل لي أزمة ألم الفقرات تماماً، المسند يدعم الرقبة بطريقة مريحة والتوصيل كان سريع ومضبوط. جزاكم الله خير على هذه الجودة النادرة.",
  },

  // 🇬🇧 English
  {
    id: "7",
    productId: "2",
    author: "David Harrison",
    avatar: "DH",
    rating: 5,
    date: "2026-08-10",
    locale: "en",
    location: "Cairo - Maadi Expat Community",
    comment:
      "Outstanding craftsmanship! The gaming chair's build quality is on par with premium European brands. The steel base, cold-cure foam, and heavy-duty tilt mechanism feel incredibly solid. Excellent customer service from Mr. Mohamed.",
  },
  {
    id: "8",
    productId: "6",
    author: "Alexander Brooks",
    avatar: "AB",
    rating: 5,
    date: "2026-08-25",
    locale: "en",
    location: "Sheikh Zayed City",
    comment:
      "Ordered custom office blackout roller blinds and an ergonomic mesh desk chair. Perfect dimensions, smooth rolling mechanism, and great sunlight blockage. Free assembly was quick and professional.",
  },
  {
    id: "9",
    productId: "1",
    author: "Claire Moreau",
    avatar: "CM",
    rating: 5,
    date: "2026-09-08",
    locale: "en",
    location: "Zamalek, Cairo",
    comment:
      "Top-tier ergonomic chair with breathable mesh. Sitting 10+ hours a day is now effortless. Highly recommended furniture store!",
  },
];

export const getReviewsByProduct = (productId?: string) => {
  if (!productId) return reviews;
  const filtered = reviews.filter((r) => r.productId === productId);
  return filtered.length > 0 ? filtered : reviews;
};
