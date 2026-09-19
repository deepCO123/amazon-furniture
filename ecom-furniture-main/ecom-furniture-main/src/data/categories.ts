import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "1",
    name: "كراسي مكتب",
    slug: "office-chairs",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
    description: "كراسي مكتبية هيدروليك طبية ومديرين بتصميم مريح لأطول ساعات العمل",
    productCount: 4,
  },
  {
    id: "2",
    name: "كراسي جيمينج",
    slug: "gaming-chairs",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600",
    description: "كراسي ألعاب احترافية شاسيه حديد مع مساند قابلة للضبط وإمالة 180 درجة",
    productCount: 3,
  },
  {
    id: "3",
    name: "مكاتب",
    slug: "office-desks",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600",
    description: "مكاتب مديرين وموظفين خشب ميلامين وزان بتصميمات عصرية راقية",
    productCount: 3,
  },
  {
    id: "4",
    name: "كراسي طبية",
    slug: "medical-chairs",
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600",
    description: "كراسي ارجونوميك لدعم فقرات الظهر والرقبة والجلوس الصحي المستقيم",
    productCount: 3,
  },
  {
    id: "5",
    name: "ركن ومجالس",
    slug: "corners-sofas",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    description: "ركنات استقبال ومجالس مكاتب خشب زان أحمر وتنجيد إسفنج كثافة 33",
    productCount: 3,
  },
  {
    id: "6",
    name: "ستائر مكتبية",
    slug: "office-curtains",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600",
    description: "ستائر رول بلاك أوت، زيبرا، وشرائح معدنية ورأسية بجميع المقاسات",
    productCount: 4,
  },
  {
    id: "7",
    name: "مكتبات ووحدات تخزين",
    slug: "storage-shelves",
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600",
    description: "مكتبات خشبية ودواليب حفظ ملفات بتشطيبات فاخرة متينة",
    productCount: 2,
  },
];

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
