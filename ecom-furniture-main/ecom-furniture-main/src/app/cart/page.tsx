"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Wrench,
  Truck,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useLanguageStore } from "@/store/languageStore";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { FREE_SHIPPING_THRESHOLD } from "@/data/shippingRates";
import { validateCoupon, type Coupon } from "@/data/coupons";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { language } = useLanguageStore();
  const isEn = language === "en";

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const total = getTotal();
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const grandTotal = Math.max(0, total - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    const result = validateCoupon(couponCodeInput, total);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discountAmount);
      setCouponFeedback({ type: "success", message: result.message });
    } else {
      setCouponFeedback({ type: "error", message: result.message });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput("");
    setCouponFeedback(null);
  };

  // Quick WhatsApp link for entire cart
  const generateQuickCartWhatsapp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://192.168.1.7:3000";
    const itemsText = items
      .map(
        (it, idx) => {
          const rawImg = it.product.images?.[0] || "";
          const fullImgUrl = rawImg
            ? rawImg.startsWith("http")
              ? rawImg
              : `${origin}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
            : "";
          return `${idx + 1}. *${it.product.name}* × ${it.quantity} (${formatPrice(
            it.product.price * it.quantity
          )})${fullImgUrl ? `\n   • 🖼️ صورة القطعة: ${fullImgUrl}` : ""}`;
        }
      )
      .join("\n\n");
    const msg = `مرحباً أستاذ محمد، أود طلب السلة التالية من متجر Amazon Furniture:\n\n${itemsText}\n\n💰 *الإجمالي الكلي:* ${formatPrice(
      grandTotal
    )}`;
    return `https://wa.me/201091084863?text=${encodeURIComponent(msg)}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={[{ label: isEn ? "Cart" : "سلة المشتريات" }]} />
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={64} className="text-muted/40 mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">
              {isEn ? "Your Cart is Empty" : "سلة المشتريات فارغة"}
            </h1>
            <p className="text-muted mb-6 text-sm">
              {isEn
                ? "Add some beautiful furniture to get started"
                : "تصفح أحدث القطع وأضف أثاثك المفضل إلى السلة"}
            </p>
            <Link href="/products">
              <Button size="lg" className="font-bold">
                {isEn ? "Browse Products" : "تصفح المتجر الآن"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: isEn ? "Cart" : "سلة المشتريات" }]} />

        <AnimatedSection className="mt-6 mb-8 text-start">
          <h1 className="text-3xl font-bold text-primary">
            {isEn ? "Shopping Cart" : "سلة المشتريات"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {items.length} {isEn ? "items selected" : "قطع مختارة"}
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.product.id}-${item.color}`}
                  layout
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-2xl p-3.5 sm:p-6 border border-surface-dark flex flex-col sm:flex-row gap-3.5 sm:gap-4 text-start shadow-xs"
                >
                  <div className="flex gap-3.5 sm:contents items-start">
                    {/* Item Image */}
                    <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-surface border border-surface-dark">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, 128px"
                      />
                    </div>

                    {/* Mobile top details + delete */}
                    <div className="flex-1 min-w-0 sm:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                            {item.product.category}
                          </p>
                          <h3 className="font-bold text-primary text-sm line-clamp-2 mt-0.5">
                            {item.product.name}
                          </h3>
                          {item.color && (
                            <p className="text-xs text-muted mt-1">
                              {isEn ? "Color:" : "اللون:"} {item.color}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="w-10 h-10 -me-1 -mt-1 rounded-xl text-muted hover:text-danger hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                          title={isEn ? "Remove item" : "حذف العنصر"}
                          aria-label={isEn ? "Remove item" : "حذف العنصر"}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop and Tablet Details Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="hidden sm:flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted uppercase tracking-wide">
                          {item.product.category}
                        </p>
                        <h3 className="font-bold text-primary text-base sm:text-lg truncate">
                          {item.product.name}
                        </h3>
                        {item.color && (
                          <p className="text-xs text-muted mt-0.5">
                            {isEn ? "Color:" : "اللون:"} {item.color}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-10 h-10 rounded-lg text-muted hover:text-danger hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                        title={isEn ? "Remove item" : "حذف العنصر"}
                        aria-label={isEn ? "Remove item" : "حذف العنصر"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Bottom Quantity Stepper & Price */}
                    <div className="pt-2 sm:pt-4 border-t border-surface-dark/60 sm:border-t-0 flex items-center justify-between">
                      <div className="flex items-center border border-surface-dark rounded-xl bg-surface overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-white text-primary transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-9 text-center text-sm font-black text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-white text-primary transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-end">
                        <span className="text-xs text-muted block sm:hidden">الإجمالي:</span>
                        <p className="font-extrabold text-primary text-base sm:text-lg" suppressHydrationWarning>
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                <span>{isEn ? "Continue Shopping" : "متابعة التسوق وإضافة قطع أخرى"}</span>
              </Link>

              <button
                onClick={clearCart}
                className="text-xs text-muted hover:text-danger transition-colors"
              >
                {isEn ? "Clear Cart" : "إفراغ السلة بالكامل"}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <AnimatedSection delay={0.1}>
            <div className="bg-white rounded-2xl p-6 border border-surface-dark sticky top-28 shadow-xs text-start">
              <h2 className="text-lg font-bold text-primary mb-4 pb-3 border-b border-surface-dark">
                {isEn ? "Order Summary" : "ملخص الطلب"}
              </h2>

              {/* Free Shipping Alert in Cart */}
              <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <Truck size={14} className="text-emerald-600" />
                    <span>مؤهل للشحن المجاني لجميع المحافظات! ✓</span>
                  </span>
                ) : (
                  <span className="text-muted block text-[11px]">
                    أضف منتجات بـ <strong className="text-accent-dark">{formatPrice(FREE_SHIPPING_THRESHOLD - total)}</strong> للحصول على <strong>شحن مجاني بالكامل!</strong>
                  </span>
                )}
              </div>

              {/* Coupon Input Box */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Tag size={13} className="text-emerald-600" />
                      <span>{appliedCoupon.code} (-{formatPrice(couponDiscount)})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1 text-emerald-600 hover:text-emerald-900 rounded cursor-pointer"
                      title="إلغاء الكوبون"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <label className="block text-xs font-bold text-primary flex items-center gap-1">
                      <Tag size={12} className="text-accent" />
                      <span>كوبون الخصم:</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="WELCOME10"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-surface-dark uppercase focus:ring-1 focus:ring-accent outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>
                    {couponFeedback && (
                      <p
                        className={`text-[11px] font-semibold ${
                          couponFeedback.type === "success" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {couponFeedback.message}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>{isEn ? "Products Subtotal" : "المجموع الفرعي للمنتجات"}</span>
                  <span className="font-semibold text-primary">{formatPrice(total)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 text-xs font-bold">
                    <span>خصم الكوبون</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {/* Assembly - 100% Free */}
                <div className="flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-100 px-3 py-2 rounded-lg">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-900">
                    <Wrench size={14} className="text-emerald-600 shrink-0" />
                    {isEn ? "Assembly & Setup" : "التركيب والمعاينة"}
                  </span>
                  <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-xs">
                    {isEn ? "100% Free ✓" : "مجاناً بالكامل ✓"}
                  </span>
                </div>

                {/* Shipping - Calculated according to location */}
                <div className="flex items-center justify-between text-xs bg-amber-50/80 border border-amber-100 px-3 py-2 rounded-lg">
                  <span className="flex items-center gap-1.5 font-medium text-amber-900">
                    <Truck size={14} className="text-amber-600 shrink-0" />
                    {isEn ? "Shipping & Delivery" : "مصاريف الشحن"}
                  </span>
                  <span className="font-semibold text-amber-800 bg-white px-2 py-0.5 rounded shadow-xs text-[11px]">
                    {isFreeShipping ? "شحن مجاني ✓" : "يُحدد بصفحة الدفع"}
                  </span>
                </div>

                <div className="border-t border-surface-dark pt-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-base text-primary block">
                      {isEn ? "Estimated Total" : "إجمالي المشتريات"}
                    </span>
                    <span className="text-[11px] text-muted block">
                      {isEn ? "(Shipping calculated at checkout)" : "(الشحن يُحسب بدقة في الخطوة التالية)"}
                    </span>
                  </div>
                  <span className="font-extrabold text-2xl text-accent-dark">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Main Checkout button */}
              <Link href="/checkout" className="block mt-6">
                <Button size="lg" className="w-full font-bold text-base shadow-sm">
                  <span>{isEn ? "Proceed to Checkout" : "متابعة إتمام الطلب والدفع"}</span>
                  <ArrowRight size={18} className="ms-2" />
                </Button>
              </Link>

              {/* Instant WhatsApp Order button */}
              <a
                href={generateQuickCartWhatsapp()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-sm transition-all"
              >
                <MessageCircle size={18} />
                <span>{isEn ? "Instant WhatsApp Order" : "طلب فوري ومباشر عبر واتساب"}</span>
              </a>

              <p className="text-[11px] text-muted text-center mt-3">
                {isEn
                  ? "Direct support from customer care team"
                  : "تأكيد فوري ودعم مباشر من فريق المبيعات"}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
