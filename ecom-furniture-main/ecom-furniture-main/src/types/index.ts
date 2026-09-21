export interface FurnitureSpecs {
  woodType?: string; // خشب زان أحمر روماني، إم دي إف ميلامين إسباني، أرو طبيعي، كونتر
  fabricType?: string; // كتان معالج، هامر تركي، قطيفة، جلد مقلوب
  waterRepellent?: boolean; // قماش مقاوم للبقع والسوائل
  foamDensity?: string; // كثافة 30، كثافة 33، كثافة 35 سوبر سوفت، ريبوند
  chassisType?: string; // شاسيه حديد دهان إلكتروستاتيك، ميكانيزم تركي، مفصلات باكم
  leadTimeDays?: number; // مدة التصنيع والتجهيز بالأيام
  requiresAssembly?: boolean; // يتطلب فني تركيب مصاحب
  isDisassemblable?: boolean; // قابل للفك والتركيب
  warrantyYears?: number; // سنوات الضمان المعتمد
  careInstructions?: string; // إرشادات التنظيف والعناية
  model3dUrl?: string; // رابط ملف 3D / AR (.glb / .usdz)
  volumetricWeight?: number; // الوزن الحجمي بالكيلوجرام (L × W × H / 5000)
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  material: string;
  color: string;
  dimensions: { width: number; height: number; depth: number };
  weight: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity?: number;
  featured: boolean;
  tags: string[];
  curtainTypes?: string[]; // أنواع الستارة المتوفرة
  specs?: FurnitureSpecs; // مصفوفة المواصفات الفنية لقطاع الأثاث
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  locale?: "ar" | "en" | "sa"; // عربي، إنجليزي، سعودي
  location?: string; // e.g. "القاهرة، مصر", "Riyadh, KSA", "London, UK"
}

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
  curtainType?: string; // نوع الستارة المختار
}

export type OrderStatus =
  | "pending" // قيد الانتظار
  | "confirmed" // تم التأكيد والعربون
  | "under_production" // قيد التصنيع بالورشة
  | "qc_passed" // اجتياز فحص الجودة
  | "ready_for_dispatch" // جاهز بالمخزن للشحن
  | "scheduled_delivery" // مجدول للتوصيل والتركيب
  | "processing" // قيد التجهيز
  | "shipped" // جاري الشحن
  | "delivered" // تم التسليم والتركيب
  | "cancelled"; // ملغي

export interface Order {
  id: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  shippingAddress: ShippingAddress;
  notes?: string;
  leadTimeDays?: number;
  requiresAssembly?: boolean;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  productId?: string;
  price: number;
  reason: "size_mismatch" | "color_mismatch" | "shipping_damage" | "factory_defect" | "customer_remorse";
  reasonDetails?: string;
  images?: string[];
  status: "pending_review" | "inspection_approved" | "rejected" | "item_received" | "refunded" | "outlet_restocked";
  conditionAssessment?: "perfect" | "minor_scratch" | "damaged";
  refundAmount?: number;
  createdAt: string;
}

export interface Quotation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  city?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  validUntil: string;
  notes?: string;
  status: "draft" | "sent" | "accepted" | "expired";
  createdAt: string;
}

export interface ConsultationBooking {
  id: string;
  fullName: string;
  phone: string;
  consultType: "mansoura" | "online";
  address: string;
  googleMapsUrl?: string;
  spaceType: string;
  preferredTime: string;
  notes?: string;
  status: "new" | "contacted" | "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  city?: string;
  role?: "customer" | "admin";
  googleId?: string;
  createdAt?: string;
  provider?: "google" | "email" | "credentials";
  ordersCount?: number;
  totalSpent?: number;
}

export interface EmailLog {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  type: "WELCOME" | "ORDER_CONFIRMATION" | "NEW_USER_ADMIN_ALERT";
  orderId?: string;
  date: string;
  htmlContent: string;
}

export type SortOption = "price-asc" | "price-desc" | "newest" | "rating";

export interface FilterState {
  category: string[];
  material: string[];
  color: string[];
  priceRange: [number, number];
  search: string;
  sort: SortOption;
}
