"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Hammer,
  Check,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import type { Order } from "@/types";

interface TrackResponse {
  success: boolean;
  order: Order;
}

const STAGES = [
  {
    key: "under_review",
    label: "تحت المراجعة",
    labelEn: "Under Review",
    desc: "تم تسجيل الطلب بالنظام وهو الآن قيد المراجعة والاعتماد",
    descEn: "Order placed and currently being reviewed and confirmed",
    icon: Clock,
  },
  {
    key: "confirmed",
    label: "تم تأكيد الحجز",
    labelEn: "Order Confirmed",
    desc: "تمت مراجعة المقاسات واعتماد أمر التشغيل",
    descEn: "Specifications verified and production approved",
    icon: CheckCircle2,
  },
  {
    key: "under_production",
    label: "قيد التصنيع بالورشة",
    labelEn: "In Production",
    desc: "جاري تصنيع وتفصيل القطع بأعلى معايير الخشب والدهان",
    descEn: "Crafting in workshop with premium beech wood and finishings",
    icon: Hammer,
  },
  {
    key: "qc_passed",
    label: "اجتياز فحص الجودة",
    labelEn: "QC Passed",
    desc: "تم الفحص الفني للتأكد من خلو القطع من أي عيوب",
    descEn: "Quality check completed with zero defects verified",
    icon: ShieldCheck,
  },
  {
    key: "ready_for_dispatch",
    label: "جاهز بالمخزن للشحن",
    labelEn: "Ready to Ship",
    desc: "القطع مغلفة بعناية وجاهزة للتحميل",
    descEn: "Carefully wrapped and ready for courier pickup",
    icon: Package,
  },
  {
    key: "shipped",
    label: "جاري الشحن والتوصيل",
    labelEn: "Out for Delivery",
    desc: "الشحنة مع سيارة التوصيل في طريقها لعنوانك",
    descEn: "Courier is on the way to your delivery address",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "تم التسليم والتركيب",
    labelEn: "Delivered & Assembled",
    desc: "تم تسليم الأثاث وتركيبه بنجاح وتفعيل الضمان 10 سنوات",
    descEn: "Delivered & assembled with 10-year warranty active",
    icon: Check,
  },
];

function getStageIndex(status: string) {
  switch (status) {
    case "under_review":
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "under_production":
      return 2;
    case "qc_passed":
      return 3;
    case "ready_for_dispatch":
    case "scheduled_delivery":
    case "processing":
      return 4;
    case "shipped":
      return 5;
    case "delivered":
      return 6;
    default:
      return 0;
  }
}

export default function OrderTrackingPage() {
  const { language } = useLanguageStore();
  const isEn = language === "en";

  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackResponse | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !phoneInput.trim()) {
      setError(
        isEn
          ? "Please enter both your Order ID and registered Phone Number to verify your identity."
          : "يرجى إدخال رقم الطلب ورقم الهاتف المسجل معاً للتحقق من هويتك."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdInput.trim(),
          phone: phoneInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ||
            (isEn
              ? "Order not found. Please verify the ID and phone number, then try again."
              : "تعذر العثور على الطلب. يرجى التحقق من الرقم والمحاولة مجدداً.")
        );
        setTrackData(null);
      } else {
        setTrackData(data);
      }
    } catch {
      setError(
        isEn
          ? "Error connecting to server. Please try again shortly."
          : "حدث خطأ في الاتصال بالخادم. يرجى المحاولة بعد قليل."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStageIdx = trackData ? getStageIndex(trackData.order.status) : 0;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[{ label: isEn ? "Order Tracking & Warranty" : "تتبع حالة الطلب والضمان" }]}
        />

        {/* Hero Section */}
        <div className="text-center mt-6 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-dark text-xs font-bold mb-3 border border-accent/20">
            <Truck size={14} />
            <span>
              {isEn
                ? "Live Tracking & Production Updates"
                : "نظام التتبع اللحظي ومتابعة تصنيع الأثاث"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-3">
            {isEn ? "Track Your Order & Warranty" : "تتبع طلبك وشهادة الضمان"}
          </h1>
          <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed">
            {isEn
              ? "Enter your Order ID and registered phone number to track live manufacturing stages, delivery status, and your official 10-year warranty certificate."
              : "أدخل رقم طلبك ورقم هاتفك المسجل لمعرفة المرحلة الحالية لتصنيع وشحن أثاثك، أو لطلب فحص وصيانة مشمولة بضمان الـ 10 سنوات."}
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#151D2A] rounded-2xl p-6 sm:p-8 border border-surface-dark shadow-sm mb-10">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={isEn ? "Order ID" : "رقم الطلب (Order ID)"}
                placeholder={isEn ? "e.g. AF-789210 or 789210" : "مثال: AF-789210 أو 789210"}
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                required
              />
              <Input
                label={isEn ? "Registered Phone Number" : "رقم الهاتف المسجل"}
                placeholder="01X XXXX XXXX"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold flex items-center justify-center gap-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <span>{isEn ? "Searching & verifying..." : "جاري البحث والتحقق..."}</span>
              ) : (
                <>
                  <Search size={18} />
                  <span>{isEn ? "Track Order Status Now" : "تتبع حالة الأوردر الآن"}</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Tracking Details View */}
        <AnimatePresence>
          {trackData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Summary Card */}
              <div className="bg-white dark:bg-[#151D2A] rounded-3xl p-6 sm:p-8 border border-surface-dark shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-dark">
                  <div>
                    <span className="text-xs text-muted block mb-1">
                      {isEn ? "Order Details:" : "تفاصيل الطلب:"}
                    </span>
                    <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                      <span>#{trackData.order.id}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        {isEn ? STAGES[currentStageIdx]?.labelEn : STAGES[currentStageIdx]?.label}
                      </span>
                    </h2>
                    <span className="text-xs text-muted mt-1 block">
                      {isEn ? "Date Placed: " : "تاريخ التسجيل: "}
                      {new Date(trackData.order.date).toLocaleDateString(
                        isEn ? "en-US" : "ar-EG",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-start sm:text-end">
                      <span className="text-xs text-muted block">
                        {isEn ? "Payment Method:" : "طريقة السداد:"}
                      </span>
                      <span className="font-bold text-sm text-primary">
                        {trackData.order.paymentMethod === "instapay"
                          ? isEn
                            ? "⚡ InstaPay Egypt"
                            : "⚡ إنستاباي"
                          : trackData.order.paymentMethod === "wallet"
                          ? isEn
                            ? "📱 Mobile Cash Wallet"
                            : "📱 فودافون كاش"
                          : trackData.order.paymentMethod === "card"
                          ? isEn
                            ? "💳 Card / Paymob"
                            : "💳 فيزا / Paymob"
                          : trackData.order.paymentMethod === "fawry"
                          ? isEn
                            ? "🔢 Fawry Pay"
                            : "🔢 فوري باي"
                          : isEn
                          ? "💵 Cash on Delivery"
                          : "💵 عند الاستلام"}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/201091084863?text=${encodeURIComponent(
                        isEn
                          ? `Hello, I would like to inquire about my order #${trackData.order.id}.`
                          : `مرحباً، أستفسر عن طلبي رقم #${trackData.order.id}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <MessageCircle size={15} />
                      <span>{isEn ? "WhatsApp Support" : "استفسار واتساب"}</span>
                    </a>
                  </div>
                </div>

                {/* 10-Year Warranty Badge Banner */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                      {isEn
                        ? "Certified 10-Year Official Warranty Certificate"
                        : "شهادة ضمان رسمي معتمد لمدة 10 سنوات"}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                      {isEn
                        ? "This order is protected by Amazon Furniture warranty against natural beech wood and high-density foam defects, with free periodic maintenance."
                        : "هذا الطلب مشمول بضمان Amazon Furniture ضد عيوب الأخشاب الزان الطبيعية والتنجيد الإسفنجي عالي الكثافة، مع صيانة دورية مجانية."}
                    </p>
                  </div>
                </div>

                {/* Interactive Multi-Stage Timeline */}
                <div className="mt-8 pt-6">
                  <h3 className="font-bold text-sm text-primary mb-6">
                    {isEn
                      ? "Order Execution & Shipping Timeline:"
                      : "مراحل تنفيذ وشحن الأوردر:"}
                  </h3>

                  <div className="relative">
                    {/* Progress Track Line */}
                    <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-100 dark:bg-slate-800 -z-0">
                      <div
                        className="h-full bg-accent transition-all duration-700"
                        style={{
                          width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 relative z-10">
                      {STAGES.map((st, idx) => {
                        const Icon = st.icon;
                        const isCompleted = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div
                            key={st.key}
                            className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                                isCompleted
                                  ? "bg-success text-white ring-4 ring-success/15"
                                  : isCurrent
                                  ? "bg-accent text-white shadow-lg ring-4 ring-accent/25 scale-110"
                                  : "bg-surface-dark text-muted"
                              }`}
                            >
                              {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                            </div>

                            <div>
                              <p
                                className={`text-xs font-bold leading-tight ${
                                  isCurrent
                                    ? "text-accent-dark"
                                    : isCompleted
                                    ? "text-primary"
                                    : "text-muted"
                                }`}
                              >
                                {isEn ? st.labelEn : st.label}
                              </p>
                              <p className="text-[10px] text-muted hidden sm:block mt-1 leading-snug">
                                {isEn ? st.descEn : st.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white dark:bg-[#151D2A] rounded-3xl p-6 sm:p-8 border border-surface-dark shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-surface-dark mb-4">
                  <h3 className="font-bold text-base text-primary">
                    {isEn ? "Ordered Items & Products:" : "القطع والمنتجات المطلوبة:"}
                  </h3>
                  <span className="text-xs text-muted font-bold">
                    {isEn ? "Invoice Total: " : "إجمالي الفاتورة: "}
                    {formatPrice(trackData.order.total)}
                  </span>
                </div>

                <div className="divide-y divide-surface-dark">
                  {trackData.order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface border border-surface-dark shrink-0">
                          <Image
                            src={it.product?.images?.[0] || "/placeholder.jpg"}
                            alt={it.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-primary">{it.product?.name}</h4>
                          <span className="text-xs text-muted block mt-0.5">
                            {isEn ? "Qty:" : "الكمية:"} {it.quantity}{" "}
                            {it.color && `• ${isEn ? "Color:" : "اللون:"} ${it.color}`}{" "}
                            {it.curtainType && `• ${it.curtainType}`}
                          </span>
                          <span className="text-xs font-bold text-accent-dark mt-1 block">
                            {formatPrice((it.product?.price || 0) * it.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
