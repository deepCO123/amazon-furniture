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
  CreditCard,
  Smartphone,
  Banknote,
  QrCode,
  Copy,
  CheckCheck,
  Printer,
  Lock,
  Zap,
  Tag,
  X,
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
import { trackPurchase } from "@/lib/analytics";
import { EGYPT_GOVERNORATES, getShippingRate, FREE_SHIPPING_THRESHOLD } from "@/data/shippingRates";
import { validateCoupon, type Coupon } from "@/data/coupons";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "يرجى كتابة الاسم ثلاثي بالكامل"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح").optional().or(z.literal("")),
  phone: z.string().min(8, "يرجى إدخال رقم هاتف / واتساب صالح"),
  city: z.string().min(2, "يرجى اختيار المحافظة"),
  address: z.string().min(5, "يرجى إدخال العنوان التفصيلي للتوصيل"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
type PaymentMethod = "cod" | "instapay" | "wallet" | "card" | "fawry";

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

  // Governorate & Shipping Calculation State
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("cairo");

  // Coupon / Promo Code State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [transactionRef, setTransactionRef] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fawryCode] = useState(() => `FAW-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [confirmedPaymentInfo, setConfirmedPaymentInfo] = useState<{
    method: PaymentMethod;
    details: Order["paymentDetails"];
    status: string;
  } | null>(null);

  const total = getTotal();
  const shippingInfo = getShippingRate(selectedGovernorate, total);
  const shippingCost = shippingInfo.cost;
  const grandTotal = Math.max(0, total - couponDiscount + shippingCost);

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
      city: "cairo",
    },
  });

  // Sync user info into form if user logs in
  useEffect(() => {
    if (user) {
      if (user.name) setValue("fullName", user.name);
      if (user.email) setValue("email", user.email);
      if (user.phone) setValue("phone", user.phone);
      if (user.city) {
        setValue("city", user.city);
        const timer = setTimeout(() => {
          setSelectedGovernorate(user.city!);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [user, setValue]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

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

  const onDeliverySubmit = (data: CheckoutForm) => {
    setCustomerData(data);
    setCurrentStep(2);
  };



  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "cod":
        return isEn ? "Cash on Delivery" : "الدفع عند الاستلام";
      case "instapay":
        return isEn ? "InstaPay Egypt" : "إنستاباي (InstaPay)";
      case "wallet":
        return isEn ? "Mobile Wallet / Vodafone Cash" : "فودافون كاش / محفظة محمول";
      case "card":
        return isEn ? "Credit / Debit Card (Paymob)" : "بطاقة بنكية (Paymob)";
      case "fawry":
        return isEn ? "Fawry Pay" : "فوري باي (Fawry)";
    }
  };

  const generateAndSendOrder = async () => {
    if (!customerData) return;
    setSubmittingOrder(true);

    const orderId = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedOrderId(orderId);

    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

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

    // Payment details construction
    const paymentStatus: NonNullable<Order["paymentStatus"]> = paymentMethod === "card" ? "paid" : "pending";
    const paymentDetailsPayload: NonNullable<Order["paymentDetails"]> = {};
    if (paymentMethod === "instapay" && transactionRef) paymentDetailsPayload.transactionRef = transactionRef;
    if (paymentMethod === "wallet" && senderPhone) paymentDetailsPayload.walletPhone = senderPhone;
    if (paymentMethod === "fawry") paymentDetailsPayload.fawryCode = fawryCode;
    if (paymentMethod === "card") paymentDetailsPayload.paidAt = new Date().toISOString();

    setConfirmedPaymentInfo({
      method: paymentMethod,
      details: paymentDetailsPayload,
      status: paymentStatus,
    });

    // Construct WhatsApp message with rich payment metadata, shipping and coupon
    let paymentMetaText = `💳 *طريقة الدفع:* ${getPaymentMethodLabel(paymentMethod)}\n`;
    if (paymentMethod === "instapay") {
      paymentMetaText += `⚡ *تحويل إنستاباي* إلى: amazonfurniture@instapay\n`;
      if (transactionRef) paymentMetaText += `🔖 *المرجع/الاسم:* ${transactionRef}\n`;
    } else if (paymentMethod === "wallet") {
      paymentMetaText += `📱 *تحويل كاش* إلى: 01091084863\n`;
      if (senderPhone) paymentMetaText += `📞 *المحفظة المحول منها:* ${senderPhone}\n`;
    } else if (paymentMethod === "card") {
      paymentMetaText += `🔒 *الدفع بالفيزا:* تم الدفع بنجاح عبر بوابة Paymob مشفرة\n`;
    } else if (paymentMethod === "fawry") {
      paymentMetaText += `🔢 *كود فوري المرجعي:* ${fawryCode} (كود خدمة: 788)\n`;
    } else {
      paymentMetaText += `💵 *الدفع عند الاستلام:* كاش بعد المعاينة والفحص\n`;
    }

    const shippingText = shippingInfo.isFree
      ? "مجاناً بالكامل ✓ (عرض الشحن المجاني فوق 25 ألف ج)"
      : formatPrice(shippingCost);

    const couponText = appliedCoupon
      ? `\n🎟️ *كوبون الخصم:* ${appliedCoupon.code} (-${formatPrice(couponDiscount)})`
      : "";

    const message = `🛒 *طلب جديد من متجر Amazon Furniture*
━━━━━━━━━━━━━━━━━━━━
📦 *رقم الطلب:* #${orderId}
👤 *اسم العميل:* ${customerData.fullName}
📧 *البريد:* ${customerEmail}
📞 *رقم الهاتف:* ${customerData.phone}
📍 *المحافظة:* ${shippingInfo.governorateName} (${shippingInfo.deliveryDays})
🏠 *العنوان التفصيلي:* ${customerData.address}
${customerData.notes ? `📝 *ملاحظات:* ${customerData.notes}\n` : ""}━━━━━━━━━━━━━━━━━━━━
${paymentMetaText}━━━━━━━━━━━━━━━━━━━━
🛋️ *القطع والمنتجات المطلوبة:*
${itemsListText}
━━━━━━━━━━━━━━━━━━━━
🔧 *التركيب والمعاينة:* مجاناً بالكامل ✓
🚚 *مصاريف الشحن:* ${shippingText}${couponText}
💰 *إجمالي الفاتورة النهائي:* ${formatPrice(grandTotal)}
━━━━━━━━━━━━━━━━━━━━
مرحباً أستاذ محمد إسماعيل، تم تقديم هذا الطلب عبر المتجر وأود تأكيده وجدولة ميعاد الاستلام.`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/201091084863?text=${encoded}`;
    setCreatedWhatsappUrl(whatsappUrl);

    // Post to Server API with shipping & coupon discount
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
          subtotal: total,
          shippingCost,
          discount: couponDiscount,
          couponCode: appliedCoupon?.code || null,
          total: grandTotal,
          status: "processing",
          date: new Date().toISOString(),
          shippingAddress: {
            firstName: customerData.fullName,
            lastName: "",
            email: customerEmail,
            phone: customerData.phone,
            address: customerData.address,
            city: shippingInfo.governorateName,
            state: shippingInfo.governorateName,
            zipCode: "00000",
          },
          notes: customerData.notes || "",
          paymentMethod,
          paymentStatus,
          paymentDetails: paymentDetailsPayload,
        }),
      });

      // Refresh product store
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
        city: shippingInfo.governorateName,
        state: shippingInfo.governorateName,
        zipCode: "00000",
      },
      paymentMethod,
      paymentStatus,
      paymentDetails: paymentDetailsPayload,
    };

    addOrder(order);
    clearCart();
    setSubmittingOrder(false);
    setCurrentStep(3);

    // Track Purchase event for GA4 and Meta Pixel
    trackPurchase(orderId, grandTotal, items);

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

        {/* Free Shipping Alert Bar if close to threshold */}
        {total < FREE_SHIPPING_THRESHOLD && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-accent/10 to-transparent border border-emerald-500/20 flex items-center justify-between text-xs text-primary">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-emerald-600 shrink-0" />
              <span>
                أضف منتجات بقيمة <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - total)}</strong> إضافية واحصل على <strong>شحن مجاني بالكامل لجميع المحافظات!</strong>
              </span>
            </div>
            <Link href="/products" className="font-bold text-accent-dark hover:underline shrink-0 hidden sm:inline">
              تصفح المزيد
            </Link>
          </div>
        )}

        {/* Progress Header */}
        <div className="flex items-center justify-center gap-4 mt-8 mb-12">
          {[
            {
              id: 1,
              title: isEn ? "Delivery Info" : "بيانات التوصيل والمحافظة",
              icon: Truck,
            },
            {
              id: 2,
              title: isEn ? "Payment Method" : "بوابة الدفع",
              icon: CreditCard,
            },
            {
              id: 3,
              title: isEn ? "Order Confirmed" : "تأكيد واستلام الفاتورة",
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
                      ? "bg-accent text-white shadow-md ring-4 ring-accent/20"
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

        {/* Step 3: Success Confirmation & Official Receipt */}
        {currentStep === 3 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-surface-dark shadow-xl text-start"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <Check size={40} className="stroke-[3]" />
              </div>
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {isEn ? "Order Received & Invoiced" : "تم استلام الطلب وتجهيز الفاتورة"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mt-3 mb-1">
                {isEn ? "Thank you for your order!" : "شكراً لثقتكم في Amazon Furniture!"}
              </h1>
              <p className="text-muted text-xs sm:text-sm max-w-md mx-auto">
                {isEn
                  ? `Your official order #${createdOrderId} has been registered with a 10-year warranty certificate.`
                  : `تم تسجيل طلبك رقم #${createdOrderId} بنجاح مع إصدار شهادة الضمان لمدة 10 سنوات.`}
              </p>
            </div>

            {/* Official Invoice Summary Box */}
            <div className="bg-surface rounded-2xl p-5 border border-surface-dark space-y-4 mb-6">
              <div className="flex items-center justify-between pb-3 border-b border-surface-dark text-xs sm:text-sm">
                <span className="text-muted">{isEn ? "Order Number:" : "رقم الطلب:"}</span>
                <span className="font-mono font-bold text-primary text-base">#{createdOrderId}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-surface-dark text-xs sm:text-sm">
                <span className="text-muted">{isEn ? "Selected Payment Gateway:" : "طريقة الدفع المحددة:"}</span>
                <div className="text-end">
                  <span className="font-bold text-primary block">
                    {confirmedPaymentInfo ? getPaymentMethodLabel(confirmedPaymentInfo.method) : "الدفع عند الاستلام"}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {confirmedPaymentInfo?.method === "card"
                      ? "مدفوع بالبطاقة (معتمد Paymob)"
                      : confirmedPaymentInfo?.method === "cod"
                      ? "سداد نقدي عند المعاينة والاستلام"
                      : "بانتظار مطابقة التحويل"}
                  </span>
                </div>
              </div>

              {/* Specific Payment Gateway Reference Box */}
              {confirmedPaymentInfo?.method === "instapay" && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                      <Zap size={14} className="text-indigo-600" />
                      عنوان الدفع اللحظي (IPA):
                    </span>
                    <span className="font-mono font-bold">amazonfurniture@instapay</span>
                  </div>
                  {confirmedPaymentInfo.details?.transactionRef && (
                    <div className="flex items-center justify-between pt-1 border-t border-indigo-100">
                      <span className="text-muted">مرجع التحويل المسجل:</span>
                      <span className="font-mono font-bold">{confirmedPaymentInfo.details.transactionRef}</span>
                    </div>
                  )}
                </div>
              )}

              {confirmedPaymentInfo?.method === "wallet" && (
                <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 text-xs text-red-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-red-800">
                      <Smartphone size={14} className="text-red-600" />
                      رقم محفظة المعرض:
                    </span>
                    <span className="font-mono font-bold" dir="ltr">01091084863</span>
                  </div>
                  {confirmedPaymentInfo.details?.walletPhone && (
                    <div className="flex items-center justify-between pt-1 border-t border-red-100">
                      <span className="text-muted">المحفظة المحول منها:</span>
                      <span className="font-mono font-bold" dir="ltr">{confirmedPaymentInfo.details.walletPhone}</span>
                    </div>
                  )}
                </div>
              )}

              {confirmedPaymentInfo?.method === "fawry" && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-amber-900">
                      <QrCode size={16} className="text-amber-600" />
                      كود فوري المرجعي للدفع:
                    </span>
                    <span className="font-mono font-extrabold text-sm text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {fawryCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    توجه لأي منفذ فوري أو عبر تطبيق MyFawry، اختر خدمة <strong>788 (مدفوعات أثاث)</strong> وأدخل الكود أعلاه خلال 48 ساعة.
                  </p>
                </div>
              )}

              {/* Recipient Details */}
              {customerData && (
                <div className="pt-2 text-xs text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>{isEn ? "Customer:" : "المستلم:"}</span>
                    <span className="font-bold text-primary">{customerData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isEn ? "Delivery Governorate:" : "المحافظة ووقت التوصيل:"}</span>
                    <span className="font-semibold text-primary">{shippingInfo.governorateName} ({shippingInfo.deliveryDays})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isEn ? "Address:" : "العنوان:"}</span>
                    <span className="font-semibold text-primary">{customerData.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isEn ? "Shipping Fee:" : "مصاريف الشحن:"}</span>
                    <span className="font-semibold text-emerald-600">
                      {shippingInfo.isFree ? "مجاناً بالكامل ✓" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>خصم الكوبون ({appliedCoupon.code}):</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-surface-dark">
                    <span className="font-bold text-primary">{isEn ? "Final Total:" : "إجمالي الفاتورة النهائي:"}</span>
                    <span className="font-extrabold text-accent-dark text-base">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {createdWhatsappUrl && (
                <a
                  href={createdWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>{isEn ? "Confirm via WhatsApp" : "تأكيد الطلب عبر واتساب"}</span>
                </a>
              )}

              <button
                onClick={() => typeof window !== "undefined" && window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all text-sm cursor-pointer border border-slate-300"
              >
                <Printer size={18} />
                <span>{isEn ? "Print Invoice" : "طباعة الفاتورة"}</span>
              </button>

              <Link href="/track" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-sm">
                  تتبع الطلب والضمان
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
                          {isEn ? "Delivery & Customer Information" : "بيانات العميل ومحافظة التوصيل"}
                        </h2>
                        <p className="text-xs text-muted">
                          {isEn
                            ? "Select your Egyptian governorate to calculate shipping rate accurately"
                            : "اختر المحافظة لمعرفة تكلفة الشحن ومدة التوصيل بدقة"}
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

                        {/* Egyptian Governorate Dynamic Select */}
                        <div>
                          <label className="block text-sm font-semibold text-primary mb-1.5">
                            {isEn ? "Governorate" : "المحافظة (حساب الشحن الفوري)"}
                          </label>
                          <select
                            value={selectedGovernorate}
                            onChange={(e) => {
                              setSelectedGovernorate(e.target.value);
                              setValue("city", e.target.value);
                            }}
                            className="w-full px-4 py-2.5 rounded-lg border border-surface-dark bg-white text-primary text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                          >
                            {EGYPT_GOVERNORATES.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.nameAr} {total >= FREE_SHIPPING_THRESHOLD ? "(شحن مجاني ✓)" : `(${g.cost} ج - ${g.deliveryDays})`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Input
                        label={isEn ? "Detailed Street Address" : "العنوان بالتفصيل (اسم الشارع، رقم العقار، الدور، علامة مميزة)"}
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

                      <Button type="submit" size="lg" className="w-full mt-4 font-bold text-base cursor-pointer">
                        {isEn ? "Proceed to Payment Gateways" : "المتابعة لاختيار بوابة الدفع وتأكيد الطلب"}
                        <ArrowRight size={18} className="ms-2" />
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* Step 2: Modern Egyptian Payment Gateways Selection */}
                {currentStep === 2 && customerData && (
                  <motion.div
                    key="step-payment-gateways"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-dark shadow-xs text-start"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-dark">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-dark flex items-center justify-center shrink-0">
                        <CreditCard size={22} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-primary">
                          {isEn ? "Select Payment Gateway" : "اختر بوابة وطريقة الدفع المفضلة"}
                        </h2>
                        <p className="text-xs text-muted">
                          {isEn
                            ? "Local Egyptian payments supported (InstaPay, Wallets, Cards, Fawry, COD)"
                            : "مدعوم كافة بوابات الدفع المحلية المصرية مع أعلى معايير التشفير والأمان"}
                        </p>
                      </div>
                    </div>

                    {/* Customer info recap mini */}
                    <div className="bg-surface rounded-xl p-3.5 mb-6 text-xs flex justify-between items-center border border-surface-dark">
                      <div>
                        <span className="text-muted block">{isEn ? "Delivering to:" : "عنوان التوصيل:"}</span>
                        <span className="font-bold text-primary">{customerData.fullName} ({customerData.phone})</span>
                        <span className="text-muted block truncate max-w-xs">{shippingInfo.governorateName} - {customerData.address}</span>
                      </div>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-3 py-1 text-xs font-semibold text-accent-dark hover:underline bg-white rounded-lg border border-surface-dark cursor-pointer"
                      >
                        {isEn ? "Edit" : "تعديل"}
                      </button>
                    </div>

                    {/* 5 Payment Methods Selector */}
                    <div className="space-y-3 mb-6">
                      {/* 1. Cash on Delivery (COD) */}
                      <label
                        onClick={() => setPaymentMethod("cod")}
                        className={`block rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          paymentMethod === "cod"
                            ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                            : "border-surface-dark hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <Banknote size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary text-sm">
                                  {isEn ? "Cash on Delivery (COD)" : "الدفع نقداً عند الاستلام"}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  {isEn ? "0% Fees" : "0 جنيه مصاريف إضافية"}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5">
                                {isEn
                                  ? "Inspect and review furniture quality thoroughly before paying"
                                  : "عاين الأثاث وافحصه واستلمه أولاً ثم ادفع لمندوب التوصيل"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* 2. InstaPay Egypt */}
                      <label
                        onClick={() => setPaymentMethod("instapay")}
                        className={`block rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          paymentMethod === "instapay"
                            ? "border-indigo-500 bg-indigo-50/40 shadow-xs"
                            : "border-surface-dark hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === "instapay"}
                              onChange={() => setPaymentMethod("instapay")}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                              <Zap size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary text-sm">
                                  {isEn ? "InstaPay Egypt (Instant Transfer)" : "إنستاباي (InstaPay Egypt)"}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                  {isEn ? "Instant 0% Fee" : "لحظي 0% عمولة"}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5">
                                {isEn
                                  ? "Direct instant bank transfer via the Central Bank of Egypt IPN network"
                                  : "تحويل بنكي فوري عبر شبكة المدفوعات اللحظية للبنك المركزي"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details for InstaPay */}
                        {paymentMethod === "instapay" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-3 border-t border-indigo-100 text-xs space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-indigo-100">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-muted block text-[10px]">عنوان الدفع اللحظي (IPA):</span>
                                  <span className="font-mono font-bold text-slate-900">amazonfurniture@instapay</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard("amazonfurniture@instapay", "ipa");
                                  }}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                                  title="نسخ"
                                >
                                  {copiedField === "ipa" ? <CheckCheck size={16} /> : <Copy size={16} />}
                                </button>
                              </div>

                              <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-s border-indigo-100 pt-2 sm:pt-0 sm:ps-3">
                                <div>
                                  <span className="text-muted block text-[10px]">رقم الهاتف المرتبط:</span>
                                  <span className="font-mono font-bold text-slate-900" dir="ltr">01091084863</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard("01091084863", "instapay-phone");
                                  }}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                                  title="نسخ"
                                >
                                  {copiedField === "instapay-phone" ? <CheckCheck size={16} /> : <Copy size={16} />}
                                </button>
                              </div>
                            </div>

                            <Input
                              label={isEn ? "Transaction Reference / Sender Name" : "اسم صاحب الحساب أو رقم المعاملة المرجعي (اختياري للتحقق الفوري)"}
                              placeholder={isEn ? "e.g. TXN-94821 or Mohamed Ali" : "مثال: رقم العملية أو اسمك في إنستاباي"}
                              value={transactionRef}
                              onChange={(e) => setTransactionRef(e.target.value)}
                            />
                          </motion.div>
                        )}
                      </label>

                      {/* 3. Mobile Wallets (Vodafone Cash / Orange / Etisalat / WE) */}
                      <label
                        onClick={() => setPaymentMethod("wallet")}
                        className={`block rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          paymentMethod === "wallet"
                            ? "border-red-500 bg-red-50/40 shadow-xs"
                            : "border-surface-dark hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === "wallet"}
                              onChange={() => setPaymentMethod("wallet")}
                              className="w-4 h-4 text-red-600 focus:ring-red-500"
                            />
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                              <Smartphone size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary text-sm">
                                  {isEn ? "Vodafone Cash & Mobile Wallets" : "فودافون كاش ومحافظ المحمول"}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                                  {isEn ? "Vodafone / Orange / Etisalat / WE" : "فودافون / أورانج / اتصالات / WE"}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5">
                                {isEn
                                  ? "Transfer to the official showroom cash wallet and verify on WhatsApp"
                                  : "تحويل مباشر لرقم كاش المعتمد للمعرض ومطابقته فوراً"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details for Wallet */}
                        {paymentMethod === "wallet" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-3 border-t border-red-100 text-xs space-y-3"
                          >
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                              <div>
                                <span className="text-muted block text-[10px]">رقم محفظة كاش المعتمد للمعرض:</span>
                                <span className="font-mono font-bold text-slate-900 text-sm" dir="ltr">01091084863</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard("01091084863", "wallet-phone");
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                {copiedField === "wallet-phone" ? <CheckCheck size={14} /> : <Copy size={14} />}
                                <span>{copiedField === "wallet-phone" ? "تم النسخ" : "نسخ الرقم"}</span>
                              </button>
                            </div>

                            <Input
                              label={isEn ? "Your Mobile Wallet Number" : "رقم المحفظة الذي قمت بالتحويل منه"}
                              placeholder="01X XXXX XXXX"
                              value={senderPhone}
                              onChange={(e) => setSenderPhone(e.target.value)}
                            />
                          </motion.div>
                        )}
                      </label>

                      {/* 4. Credit / Debit Cards (Paymob 3D Secure) */}
                      <label
                        onClick={() => setPaymentMethod("card")}
                        className={`block rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          paymentMethod === "card"
                            ? "border-blue-500 bg-blue-50/40 shadow-xs"
                            : "border-surface-dark hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === "card"}
                              onChange={() => setPaymentMethod("card")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <CreditCard size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary text-sm">
                                  {isEn ? "Credit / Debit Card (Paymob)" : "البطاقات البنكية (Visa / MasterCard / ميزة)"}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                                  <Lock size={10} />
                                  <span>256-bit SSL</span>
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5">
                                {isEn
                                  ? "Secure online payment powered by Paymob Gateway with 3D Secure OTP"
                                  : "بوابة Paymob المعتمدة المشفرة مع توثيق OTP البنكي"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details for Card */}
                        {paymentMethod === "card" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-3 border-t border-blue-100 text-xs space-y-3"
                          >
                            <Input
                              label={isEn ? "Cardholder Name" : "اسم حامل البطاقة (كما هو مدون على الكارت)"}
                              placeholder="MOHAMED AHMED"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                            />

                            <Input
                              label={isEn ? "Card Number" : "رقم البطاقة (16 رقماً)"}
                              placeholder="•••• •••• •••• ••••"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label={isEn ? "Expiry Date" : "تاريخ الصلاحية"}
                                placeholder="MM/YY"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                              />
                              <Input
                                label={isEn ? "Security Code (CVV)" : "رمز الأمان (CVV)"}
                                placeholder="•••"
                                maxLength={4}
                                type="password"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-blue-800 bg-blue-100/60 p-2.5 rounded-lg">
                              <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                              <span>بيانات بطاقتك مشفرة ولا يتم تخزينها أبداً على الخادم، وتتم المعالجة عبر بوابة Paymob المصرفية.</span>
                            </div>
                          </motion.div>
                        )}
                      </label>

                      {/* 5. Fawry Pay */}
                      <label
                        onClick={() => setPaymentMethod("fawry")}
                        className={`block rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          paymentMethod === "fawry"
                            ? "border-amber-500 bg-amber-50/40 shadow-xs"
                            : "border-surface-dark hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === "fawry"}
                              onChange={() => setPaymentMethod("fawry")}
                              className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                            />
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <QrCode size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary text-sm">
                                  {isEn ? "Fawry Pay" : "فوري باي (Fawry Pay)"}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                  {isEn ? "+150,000 Outlets" : "أكثر من 150 ألف نقطة"}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5">
                                {isEn
                                  ? "Pay in cash at any kiosk, pharmacy, supermarket, or via MyFawry app"
                                  : "ادفع نقداً برقم الخدمة في أي محل أو كشك به ماكينة فوري أو تطبيق MyFawry"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details for Fawry */}
                        {paymentMethod === "fawry" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-3 border-t border-amber-100 text-xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200">
                              <div>
                                <span className="text-muted block text-[10px]">كود الدفع المرجعي الصادر لطلبك:</span>
                                <span className="font-mono font-extrabold text-amber-900 text-sm">{fawryCode}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(fawryCode, "fawry-code");
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                {copiedField === "fawry-code" ? <CheckCheck size={14} /> : <Copy size={14} />}
                                <span>{copiedField === "fawry-code" ? "تم النسخ" : "نسخ الكود"}</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-amber-800">
                              • كود الخدمة في ماكينات فوري: <strong>788 (مدفوعات أثاث)</strong> | الصلاحية: 48 ساعة.
                            </p>
                          </motion.div>
                        )}
                      </label>
                    </div>

                    {/* Submit Order Buttons */}
                    <div className="space-y-3 pt-2">
                      <button
                        onClick={generateAndSendOrder}
                        disabled={submittingOrder}
                        className="w-full py-4 px-6 rounded-xl bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <ShieldCheck size={22} />
                        <span>
                          {submittingOrder
                            ? (isEn ? "Confirming order..." : "جاري تسجيل وتأكيد الطلب...")
                            : (isEn ? "Confirm Order & Reserve" : "تأكيد الطلب وحجز المنتجات")}
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentStep(1)}
                        className="w-full py-2.5 text-sm text-muted hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
                  {isEn ? "Order Summary" : "ملخص المنتجات والطلب"}
                </h3>

                <div className="max-h-56 overflow-y-auto space-y-3 mb-4 pe-1">
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

                {/* Promo Code Coupon Input Box */}
                <div className="mb-4 pt-3 border-t border-surface-dark">
                  {appliedCoupon ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Tag size={14} className="text-emerald-600" />
                        <span>كوبون: {appliedCoupon.code} (-{formatPrice(couponDiscount)})</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1 text-emerald-600 hover:text-emerald-900 rounded"
                        title="إلغاء الكوبون"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <label className="block text-xs font-bold text-primary flex items-center gap-1">
                        <Tag size={12} className="text-accent" />
                        <span>هل لديك كوبون خصم؟</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="مثال: WELCOME10"
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

                {/* Pricing Breakdown */}
                <div className="space-y-2.5 text-sm pt-3 border-t border-surface-dark">
                  <div className="flex justify-between text-muted text-xs">
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
                  <div className="flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-900">
                      <Wrench size={13} className="text-emerald-600 shrink-0" />
                      {isEn ? "Installation & Assembly" : "التركيب والمعاينة"}
                    </span>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-xs text-[11px]">
                      {isEn ? "100% Free ✓" : "مجاناً بالكامل ✓"}
                    </span>
                  </div>

                  {/* Shipping Rate Dynamic */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Truck size={13} className="text-accent shrink-0" />
                      <span>شحن ({shippingInfo.governorateName}):</span>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        shippingInfo.isFree
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-white text-slate-800 shadow-xs"
                      }`}
                    >
                      {shippingInfo.isFree ? "مجاني ✓" : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-primary pt-3 border-t border-surface-dark">
                    <div>
                      <span className="font-bold text-base block">{isEn ? "Final Total" : "إجمالي الفاتورة"}</span>
                      <span className="text-[10px] text-muted block">
                        (شامل المنتجات والشحن والتركيب)
                      </span>
                    </div>
                    <span className="font-extrabold text-xl text-accent-dark">
                      {formatPrice(grandTotal)}
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
