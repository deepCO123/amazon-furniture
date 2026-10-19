import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "1",
    name: "كراسي شبك",
    slug: "mesh-chairs",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
    description: "كراسي شبك مكتبية مريحة بتصميم عصري وتهوية ممتازة لأطول ساعات العمل",
    productCount: 4,
  },
  {
    id: "2",
    name: "كراسي طبية",
    slug: "medical-chairs",
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600",
    description: "كراسي ارجونوميك طبية لدعم فقرات الظهر والرقبة والجلوس الصحي المستقيم",
    productCount: 3,
  },
  {
    id: "3",
    name: "ترابيزة تليفزيون",
    slug: "tv-tables",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600",
    description: "ترابيزات تليفزيون عصرية بتصميمات أنيقة تناسب جميع المساحات",
    productCount: 3,
  },
  {
    id: "4",
    name: "ستائر مكتبية",
    slug: "office-curtains",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600",
    description: "ستائر رول بلاك أوت، زيبرا، وشرائح معدنية ورأسية بجميع المقاسات",
    productCount: 4,
  },
  {
    id: "5",
    name: "مكاتب",
    slug: "office-desks",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600",
    description: "مكاتب مديرين وموظفين خشب ميلامين وزان بتصميمات عصرية راقية",
    productCount: 3,
  },
  {
    id: "6",
    name: "انتريهات",
    slug: "living-sets",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    description: "انتريهات وصالونات استقبال بتصميمات كلاسيك ومودرن وتنجيد فاخر",
    productCount: 3,
  },
  {
    id: "7",
    name: "كراسي جلد",
    slug: "leather-chairs",
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600",
    description: "كراسي جلد طبيعي وصناعي فاخرة بتصميم مريح للمكاتب والمنازل",
    productCount: 2,
  },
];

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
