"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Truck,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  Wrench,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Breadcrumb from "@/components/layout/Breadcrumb";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { useProductStore } from "@/store/productStore";
import type { Order } from "@/types";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "يرجى كتابة الاسم ثلاثي بالكامل"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح").optional().or(z.literal("")),
  phone: z.string().min(8, "يرجى إدخال رقم هاتف / واتساب صالح"),
  city: z.string().min(2, "يرجى إدخال المدينة / المحافظة"),
  address: z.string().min(5, "يرجى إدخال العنوان التفصيلي للتوصيل"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, addOrder } = useAuthStore();
  const { language } = useLanguageStore();
  const isEn = language === "en";

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [customerData, setCustomerData] = useState<CheckoutForm | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [createdWhatsappUrl, setCreatedWhatsappUrl] = useState<string>("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const total = getTotal();
  const grandTotal = total;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: user?.city || "",
    },
  });

  // Sync user info into form if user logs in
  useEffect(() => {
    if (user) {
      if (user.name) setValue("fullName", user.name);
      if (user.email) setValue("email", user.email);
      if (user.phone) setValue("phone", user.phone);
      if (user.city) setValue("city", user.city);
    }
  }, [user, setValue]);

  const onDeliverySubmit = (data: CheckoutForm) => {
    setCustomerData(data);
    setCurrentStep(2);
  };

  const generateAndSendOrder = async () => {
    if (!customerData) return;
    setSubmittingOrder(true);

    const orderId = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedOrderId(orderId);

    const origin = typeof window !== "undefined" ? window.location.origin : "http://192.168.1.7:3000";

    // Format products list with direct image links for WhatsApp
    const itemsListText = items
      .map((item, i) => {
        const colorText = item.color ? ` (اللون: ${item.color})` : "";
        const curtainText = item.curtainType ? ` [نوع الستارة: ${item.curtainType}]` : "";
        const rawImg = item.product.images?.[0] || "";
        const fullImgUrl = rawImg
          ? rawImg.startsWith("http")
            ? rawImg
            : `${origin}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
          : "";

        return `${i + 1}. *${item.product.name}*${colorText}${curtainText}\n   • الكمية: ${
          item.quantity
        } قطعة\n   • السعر: ${formatPrice(item.product.price * item.quantity)}${
          fullImgUrl ? `\n   • 🖼️ صورة القطعة: ${fullImgUrl}` : ""
        }`;
      })
      .join("\n\n");

    const customerEmail = customerData.email || user?.email || "customer@amazonfurniture.com";

    const message = `🛒 *طلب جديد من متجر Amazon Furniture*
━━━━━━━━━━━━━━━━━━━━
📦 *رقم الطلب:* #${orderId}
👤 *اسم العميل:* ${customerData.fullName}
📧 *البريد:* ${customerEmail}
📞 *رقم الهاتف:* ${customerData.phone}
📍 *المدينة / المحافظة:* ${customerData.city}
🏠 *العنوان التفصيلي:* ${customerData.address}
${customerData.notes ? `📝 *ملاحظات:* ${customerData.notes}\n` : ""}━━━━━━━━━━━━━━━━━━━━
🛋️ *القطع والمنتجات المطلوبة:*
${itemsListText}
━━━━━━━━━━━━━━━━━━━━
🔧 *التركيب:* مجاناً بالكامل ✓
🚚 *الشحن:* يُحدد حسب العنوان والمحافظة
💰 *إجمالي المنتجات:* ${formatPrice(total)}
━━━━━━━━━━━━━━━━━━━━
مرحباً أستاذ محمد إسماعيل، تم تقديم هذا الطلب عبر المتجر وأود تأكيده وتحديد تكلفة الشحن وموعد الاستلام.`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/201091084863?text=${encoded}`;
    setCreatedWhatsappUrl(whatsappUrl);

    // 1. Post to Server API to deduct stock from products.json, record customer CRM, & send order confirmation email
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          userId: user?.id,
          customerName: customerData.fullName,
          customerEmail,
          customerPhone: customerData.phone,
          items: items.map((it) => ({
            product: it.product,
            quantity: it.quantity,
            color: it.color,
            curtainType: it.curtainType,
          })),
          total: grandTotal,
          status: "processing",
          date: new Date().toISOString(),
          shippingAddress: {
            firstName: customerData.fullName,
            lastName: "",
            email: customerEmail,
            phone: customerData.phone,
            address: customerData.address,
            city: customerData.city,
            state: customerData.city,
            zipCode: "00000",
          },
          notes: customerData.notes || "",
        }),
      });

      // Refresh product store so stocks are immediately decremented in storefront
      useProductStore.getState().fetchProducts();
    } catch (err) {
      console.error("Failed to sync order to server API:", err);
    }

    // Save order in local user store
    const order: Order = {
      id: orderId,
      items: [...items],
      total: grandTotal,
      status: "processing",
      date: new Date().toISOString(),
      shippingAddress: {
        firstName: customerData.fullName,
        lastName: "",
        email: customerEmail,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.city,
        zipCode: "00000",
      },
    };

    addOrder(order);
    clearCart();
    setSubmittingOrder(false);
    setCurrentStep(3);

    // Open WhatsApp
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank");
    }
  };

  if (items.length === 0 && currentStep !== 3) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-surface-dark shadow-xs">
          <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto mb-4">
            <Truck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            {isEn ? "Your cart is empty" : "سلة المشتريات فارغة"}
          </h1>
          <p className="text-muted mb-6 text-sm">
            {isEn
              ? "Add items to your cart before proceeding to checkout."
              : "لم تقم بإضافة أي قطع إلى سلتك حتى الآن."}
          </p>
          <Link href="/products">
            <Button size="lg" className="w-full">
              {isEn ? "Continue Shopping" : "تصفح المنتجات الآن"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: isEn ? "Cart" : "السلة", href: "/cart" },
            { label: isEn ? "Checkout" : "إتمام الطلب والدفع" },
          ]}
        />

        {/* Progress Header */}
        <div className="flex items-center justify-center gap-4 mt-8 mb-12">
          {[
            {
              id: 1,
              title: isEn ? "Delivery Info" : "بيانات التوصيل",
              icon: Truck,
            },
            {
              id: 2,
              title: isEn ? "WhatsApp Payment" : "الدفع عبر واتساب",
              icon: MessageCircle,
            },
            {
              id: 3,
              title: isEn ? "Order Confirmed" : "تم تأكيد الطلب",
              icon: Check,
            },
          ].map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep > step.id
                      ? "bg-success text-white"
                      : currentStep === step.id
                      ? "bg-[#25D366] text-white shadow-md ring-4 ring-[#25D366]/20"
                      : "bg-surface-dark text-muted"
                  }`}
                >
                  {currentStep > step.id ? <Check size={16} /> : step.id}
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold hidden md:inline ${
                    currentStep >= step.id ? "text-primary" : "text-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 ${
                    currentStep > step.id ? "bg-success" : "bg-surface-dark"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 3: Success Confirmation */}
        {currentStep === 3 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-surface-dark shadow-sm text-center"
          >
            <div className="w-20 h-20 bg-[#25D366]/15 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-5">
              <Check size={40} className="stroke-[3]" />
            </div>
            <span className="text-xs uppercase tracking-widest text-[#25D366] font-bold bg-[#25D366]/10 px-3 py-1 rounded-full">
              {isEn ? "Order Placed Successfully" : "تم إرسال الطلب بنجاح"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mt-3 mb-2">
              {isEn ? "Thank you for your order!" : "شكراً لطلبك من Amazon Furniture!"}
            </h1>
            <p className="text-muted text-sm max-w-lg mx-auto mb-6">
              {isEn
                ? `Your order #${createdOrderId} has been received. If WhatsApp did not open automatically, click the button below to connect with Mohamed Esmaeil.`
                : `تم تجهيز طلبك رقم #${createdOrderId}. في حال لم تفتح نافذة واتساب تلقائياً، اضغط على الزر أدناه لمتابعة الطلب والدفع مع الأستاذ محمد إسماعيل.`}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {createdWhatsappUrl && (
                <a
                  href={createdWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-md transition-all text-base"
                >
                  <MessageCircle size={20} />
                  <span>{isEn ? "Open WhatsApp Chat" : "فتح محادثة واتساب الآن"}</span>
                </a>
              )}
              <Link href="/products" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  {isEn ? "Browse More Furniture" : "العودة للمتجر"}
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Form or Payment Step */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step-delivery"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-dark shadow-xs"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-dark">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-dark flex items-center justify-center shrink-0">
                        <Truck size={20} />
                      </div>
                      <div className="text-start">
                        <h2 className="text-xl font-bold text-primary">
                          {isEn ? "Delivery & Customer Information" : "بيانات العميل والتوصيل"}
                        </h2>
                        <p className="text-xs text-muted">
                          {isEn
                            ? "Please enter your address for delivery"
                            : "يرجى كتابة عنوان ورقم هاتف التوصيل بدقة"}
                        </p>
                      </div>
                    </div>

                    {!user && (
                      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#C5A880]/15 to-transparent border border-[#C5A880]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B6E45]">
                            <Sparkles size={14} />
                            <span>تسجيل وتوثيق كعميل VIP</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            سجل دخول بضغطة واحدة بحساب Google لتوثيق أوردراتك واستلام إشعار الترحيب والفاتورة على بريدك.
                          </p>
                        </div>
                        <GoogleAuthButton
                          className="shrink-0"
                          text="دخول سريع بـ Google"
                        />
                      </div>
                    )}

                    <form
                      onSubmit={handleSubmit(onDeliverySubmit)}
                      className="space-y-4 text-start"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label={isEn ? "Full Name" : "الاسم ثلاثي بالكامل"}
                          placeholder={isEn ? "e.g. John Doe" : "مثال: أحمد محمود إبراهيم"}
                          error={errors.fullName?.message}
                          {...register("fullName")}
                        />
                        <Input
                          label={isEn ? "Email Address (for VIP receipt & order updates)" : "البريد الإلكتروني (لتأكيد الطلب والفاتورة)"}
                          placeholder="example@gmail.com"
                          type="email"
                          error={errors.email?.message}
                          {...register("email")}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label={isEn ? "Phone / WhatsApp Number" : "رقم الهاتف / الواتساب"}
                          placeholder="01X XXXX XXXX / +966 ..."
                          type="tel"
                          error={errors.phone?.message}
                          {...register("phone")}
                        />
                        <Input
                          label={isEn ? "City / Region" : "المدينة / المحافظة"}
                          placeholder={isEn ? "e.g. Cairo / Riyadh" : "مثال: القاهرة / الجيزة / الرياض"}
                          error={errors.city?.message}
                          {...register("city")}
                        />
                      </div>

                      <Input
                        label={isEn ? "Detailed Street Address" : "العنوان بالتفصيل (اسم الشارع، رقم العقار، الدور)"}
                        placeholder={isEn ? "Street, building, apartment..." : "شارع، رقم العمارة، رقم الشقة، علامة مميزة"}
                        error={errors.address?.message}
                        {...register("address")}
                      />

                      <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">
                          {isEn ? "Special Notes (Optional)" : "ملاحظات إضافية على الطلب (اختياري)"}
                        </label>
                        <textarea
                          rows={3}
                          placeholder={
                            isEn
                              ? "Any preferred delivery time or customization requests..."
                              : "أي تفاصيل خاصة بموعد الاستلام أو تعديل بالمقاسات والألوان..."
                          }
                          className="w-full px-4 py-2.5 rounded-lg border border-surface-dark bg-white text-primary placeholder:text-muted transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none text-sm"
                          {...register("notes")}
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full mt-4 font-bold text-base">
                        {isEn ? "Proceed to Payment via WhatsApp" : "المتابعة لمرحلة الدفع وتأكيد الواتساب"}
                        <ArrowRight size={18} className="ms-2" />
                      </Button>
                    </form>
                  </motion.div>
                )}

                {currentStep === 2 && customerData && (
                  <motion.div
                    key="step-whatsapp-pay"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-dark shadow-xs text-start"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-dark">
                      <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                        <MessageCircle size={22} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-primary">
                          {isEn ? "Confirm & Pay via WhatsApp" : "الدفع وتأكيد الطلب عبر واتساب"}
                        </h2>
                        <p className="text-xs text-muted">
                          {isEn
                            ? "Complete your order with Mohamed Esmaeil"
                            : "تواصل مباشر مع الإدارة لتأكيد الحجز والدفع"}
                        </p>
                      </div>
                    </div>

                    {/* Customer info recap */}
                    <div className="bg-surface rounded-xl p-4 mb-6 text-sm space-y-1.5 border border-surface-dark">
                      <div className="flex justify-between items-center text-xs font-semibold text-accent-dark pb-1 border-b border-surface-dark">
                        <span>{isEn ? "Recipient Details" : "بيانات المستلم والتوصيل:"}</span>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-primary hover:underline text-xs"
                        >
                          {isEn ? "Edit" : "تعديل"}
                        </button>
                      </div>
                      <p className="font-bold text-primary">{customerData.fullName}</p>
                      <p className="text-muted" dir="ltr">{customerData.phone}</p>
                      <p className="text-muted">{customerData.address} - {customerData.city}</p>
                    </div>

                    {/* Explanation Box */}
                    <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-5 mb-6 text-sm text-primary">
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={22} className="text-[#25D366] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#1e8a45] mb-1">
                            {isEn ? "Direct Order via Official WhatsApp" : "طلب مباشر ومضمون عبر واتساب المعرض"}
                          </p>
                          <p className="text-xs sm:text-sm text-primary/80 leading-relaxed">
                            {isEn
                              ? "Upon clicking the button below, your complete order summary will be sent directly to Mr. Mohamed Esmaeil on WhatsApp (+20 109 1084863) to arrange payment (Cash on Delivery, Bank Transfer, InstaPay, Vodafone Cash) and schedule delivery."
                              : "عند الضغط على الزر أدناه، سيتم فتح محادثة واتساب الرسمية مع الأستاذ محمد إسماعيل (+20 109 1084863) متضمنة كامل تفاصيل وسعر القطع المطلوبة، للاتفاق على طريقة الدفع (كاش عند الاستلام أو تحويل بنكي / إنستاباي / فودافون كاش) وتحديد موعد الشحن والتوصيل."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={generateAndSendOrder}
                        disabled={submittingOrder}
                        className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <MessageCircle size={24} />
                        <span>
                          {submittingOrder
                            ? (isEn ? "Processing order..." : "جاري تسجيل الطلب...")
                            : (isEn ? "Complete Order & Chat on WhatsApp" : "تأكيد الطلب والدفع عبر واتساب الآن")}
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentStep(1)}
                        className="w-full py-2.5 text-sm text-muted hover:text-primary transition-colors flex items-center justify-center gap-1"
                      >
                        <ArrowLeft size={16} />
                        <span>{isEn ? "Back to delivery details" : "الرجوع لتعديل بيانات التوصيل"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1 sticky top-24">
              <div className="bg-white rounded-2xl p-6 border border-surface-dark shadow-xs text-start">
                <h3 className="font-bold text-lg text-primary mb-4 pb-3 border-b border-surface-dark">
                  {isEn ? "Order Summary" : "ملخص المنتجات المطلوبة"}
                </h3>

                <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pe-1">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.color}`}
                      className="flex items-center gap-3 text-sm pb-3 border-b border-surface-dark/50 last:border-0"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface shrink-0 border border-surface-dark">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-xs truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-muted">
                          {isEn ? "Qty:" : "الكمية:"} {item.quantity}{" "}
                          {item.color && `• ${item.color}`}
                        </p>
                        {item.curtainType && (
                          <span className="inline-block text-[10px] font-bold text-[#8B6E45] bg-[#C5A880]/15 px-2 py-0.5 rounded mt-0.5">
                            النوع: {item.curtainType}
                          </span>
                        )}
                        <p className="font-bold text-accent-dark text-xs mt-0.5">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm pt-3 border-t border-surface-dark">
                  <div className="flex justify-between text-muted text-xs">
                    <span>{isEn ? "Products Subtotal" : "المجموع الفرعي للمنتجات"}</span>
                    <span className="font-semibold text-primary">{formatPrice(total)}</span>
                  </div>

                  {/* Assembly - 100% Free */}
                  <div className="flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-100 px-2.5 py-2 rounded-lg">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-900">
                      <Wrench size={13} className="text-emerald-600 shrink-0" />
                      {isEn ? "Installation & Assembly" : "التركيب والمعاينة"}
                    </span>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-xs">
                      {isEn ? "100% Free ✓" : "مجاناً بالكامل ✓"}
                    </span>
                  </div>

                  {/* Shipping - Calculated according to location */}
                  <div className="flex items-center justify-between text-xs bg-amber-50/80 border border-amber-100 px-2.5 py-2 rounded-lg">
                    <span className="flex items-center gap-1.5 font-medium text-amber-900">
                      <Truck size={13} className="text-amber-600 shrink-0" />
                      {isEn ? "Shipping & Delivery" : "مصاريف الشحن"}
                    </span>
                    <span className="font-semibold text-amber-800 bg-white px-2 py-0.5 rounded shadow-xs text-[11px]">
                      {isEn ? "Calculated by Address" : "يُحدد حسب العنوان"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-primary pt-3 border-t border-surface-dark">
                    <div>
                      <span className="font-bold text-base block">{isEn ? "Products Total" : "إجمالي المنتجات"}</span>
                      <span className="text-[10px] text-muted block">
                        {isEn ? "(Shipping added on confirmation)" : "(مصاريف الشحن تُضاف عند الاتفاق والتأكيد)"}
                      </span>
                    </div>
                    <span className="font-extrabold text-xl text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Manager Card */}
                <div className="mt-6 pt-4 border-t border-surface-dark text-xs text-muted flex items-center gap-2">
                  <User size={16} className="text-accent shrink-0" />
                  <span>
                    {isEn ? "Managing Contact:" : "المسؤول المباشر:"}{" "}
                    <strong className="text-primary font-bold">Mohamed Esmaeil</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
