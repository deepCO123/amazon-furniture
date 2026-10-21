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
  RotateCcw,
  MessageCircle,
  AlertCircle,
  Hammer,
  Check,
  Send,
  X,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import type { Order, ReturnRequest, CartItem } from "@/types";

interface TrackResponse {
  success: boolean;
  order: Order;
  returns: ReturnRequest[];
}

const STAGES = [
  { key: "under_review", label: "تحت المراجعة", desc: "تم تسجيل الطلب بالنظام وهو الآن قيد المراجعة والاعتماد", icon: Clock },
  { key: "confirmed", label: "تم تأكيد الحجز", desc: "تمت مراجعة المقاسات واعتماد أمر التشغيل", icon: CheckCircle2 },
  { key: "under_production", label: "قيد التصنيع بالورشة", desc: "جاري تصنيع وتفصيل القطع بأعلى معايير الخشب والدهان", icon: Hammer },
  { key: "qc_passed", label: "اجتياز فحص الجودة", desc: "تم الفحص الفني للتأكد من خلو القطع من أي عيوب", icon: ShieldCheck },
  { key: "ready_for_dispatch", label: "جاهز بالمخزن للشحن", desc: "القطع مغلفة بعناية وجاهزة للتحميل", icon: Package },
  { key: "shipped", label: "جاري الشحن والتوصيل", desc: "الشحنة مع سيارة التوصيل في طريقها لعنوانك", icon: Truck },
  { key: "delivered", label: "تم التسليم والتركيب", desc: "تم تسليم الأثاث وتركيبه بنجاح وتفعيل الضمان 10 سنوات", icon: Check },
];

function getStageIndex(status: string) {
  switch (status) {
    case "under_review":
    case "pending": return 0;
    case "confirmed": return 1;
    case "under_production": return 2;
    case "qc_passed": return 3;
    case "ready_for_dispatch":
    case "scheduled_delivery":
    case "processing": return 4;
    case "shipped": return 5;
    case "delivered": return 6;
    default: return 0;
  }
}

export default function OrderTrackingPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackResponse | null>(null);

  // Return Request Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedProductForReturn, setSelectedProductForReturn] = useState<CartItem | null>(null);
  const [returnReason, setReturnReason] = useState<ReturnRequest["reason"]>("factory_defect");
  const [returnDetails, setReturnDetails] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !phoneInput.trim()) {
      setError("يرجى إدخال رقم الطلب ورقم الهاتف المسجل معاً للتحقق من هويتك.");
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
        setError(data.error || "تعذر العثور على الطلب. يرجى التحقق من الرقم والمحاولة مجدداً.");
        setTrackData(null);
      } else {
        setTrackData(data);
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم. يرجى المحاولة بعد قليل.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackData || !selectedProductForReturn) return;

    setSubmittingReturn(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: trackData.order.id,
          customerName: trackData.order.customerName,
          customerPhone: trackData.order.customerPhone || phoneInput,
          productName: selectedProductForReturn.product?.name || "قطعة أثاث",
          productId: selectedProductForReturn.product?.id || "",
          price: selectedProductForReturn.product?.price || 0,
          reason: returnReason,
          reasonDetails: returnDetails,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReturnSuccessMsg("تم تسجيل طلب الاسترجاع/الصيانة بنجاح! سيتم التواصل معك خلال 24 ساعة من فريق الجودة.");
        // Refresh tracking data
        const refreshRes = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: trackData.order.id, phone: phoneInput.trim() }),
        });
        if (refreshRes.ok) {
          const fresh = await refreshRes.json();
          setTrackData(fresh);
        }
        setTimeout(() => {
          setReturnModalOpen(false);
          setReturnSuccessMsg(null);
          setReturnDetails("");
        }, 3000);
      } else {
        alert(data.error || "حدث خطأ أثناء تقديم الطلب.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const currentStageIdx = trackData ? getStageIndex(trackData.order.status) : 0;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "تتبع حالة الطلب والضمان" }]} />

        {/* Hero Section */}
        <div className="text-center mt-6 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-dark text-xs font-bold mb-3 border border-accent/20">
            <Truck size={14} />
            <span>نظام التتبع اللحظي ومتابعة تصنيع الأثاث</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-3">
            تتبع طلبك وشهادة الضمان
          </h1>
          <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed">
            أدخل رقم طلبك ورقم هاتفك المسجل لمعرفة المرحلة الحالية لتصنيع وشحن أثاثك، أو لطلب فحص وصيانة مشمولة بضمان الـ 10 سنوات.
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-surface-dark shadow-sm mb-10">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم الطلب (Order ID)"
                placeholder="مثال: AF-789210 أو 789210"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                required
              />
              <Input
                label="رقم الهاتف المسجل"
                placeholder="01X XXXX XXXX"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
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
                <span>جاري البحث والتحقق...</span>
              ) : (
                <>
                  <Search size={18} />
                  <span>تتبع حالة الأوردر الآن</span>
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
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-dark shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-dark">
                  <div>
                    <span className="text-xs text-muted block mb-1">تفاصيل الطلب:</span>
                    <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                      <span>#{trackData.order.id}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {STAGES[currentStageIdx]?.label}
                      </span>
                    </h2>
                    <span className="text-xs text-muted mt-1 block">
                      تاريخ التسجيل: {new Date(trackData.order.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-start sm:text-end">
                      <span className="text-xs text-muted block">طريقة السداد:</span>
                      <span className="font-bold text-sm text-primary">
                        {trackData.order.paymentMethod === "instapay"
                          ? "⚡ إنستاباي"
                          : trackData.order.paymentMethod === "wallet"
                          ? "📱 فودافون كاش"
                          : trackData.order.paymentMethod === "card"
                          ? "💳 فيزا / Paymob"
                          : trackData.order.paymentMethod === "fawry"
                          ? "🔢 فوري باي"
                          : "💵 عند الاستلام"}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/201091084863?text=${encodeURIComponent(
                        `مرحباً، أستفسر عن طلبي رقم #${trackData.order.id}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <MessageCircle size={15} />
                      <span>استفسار واتساب</span>
                    </a>
                  </div>
                </div>

                {/* 10-Year Warranty Badge Banner */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                      شهادة ضمان رسمي معتمد لمدة 10 سنوات
                    </h4>
                    <p className="text-[11px] sm:text-xs text-amber-900/80 mt-0.5">
                      هذا الطلب مشمول بضمان Amazon Furniture ضد عيوب الأخشاب الزان الطبيعية والتنجيد الإسفنجي عالي الكثافة، مع صيانة دورية مجانية.
                    </p>
                  </div>
                </div>

                {/* Interactive Multi-Stage Timeline */}
                <div className="mt-8 pt-6">
                  <h3 className="font-bold text-sm text-primary mb-6">مراحل تنفيذ وشحن الأوردر:</h3>

                  <div className="relative">
                    {/* Progress Track Line */}
                    <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-100 -z-0">
                      <div
                        className="h-full bg-accent transition-all duration-700"
                        style={{ width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 relative z-10">
                      {STAGES.map((st, idx) => {
                        const Icon = st.icon;
                        const isCompleted = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={st.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
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
                                  isCurrent ? "text-accent-dark" : isCompleted ? "text-primary" : "text-muted"
                                }`}
                              >
                                {st.label}
                              </p>
                              <p className="text-[10px] text-muted hidden sm:block mt-1 leading-snug">
                                {st.desc}
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
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-dark shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-surface-dark mb-4">
                  <h3 className="font-bold text-base text-primary">القطع والمنتجات المطلوبة:</h3>
                  <span className="text-xs text-muted font-bold">
                    إجمالي الفاتورة: {formatPrice(trackData.order.total)}
                  </span>
                </div>

                <div className="divide-y divide-surface-dark">
                  {trackData.order.items.map((it, idx) => (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface border border-surface-dark shrink-0">
                          <Image
                            src={it.product?.images?.[0] || "/placeholder.jpg"}
                            alt={it.product?.name || "قطعة أثاث"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-primary">{it.product?.name}</h4>
                          <span className="text-xs text-muted block mt-0.5">
                            الكمية: {it.quantity} {it.color && `• اللون: ${it.color}`} {it.curtainType && `• ${it.curtainType}`}
                          </span>
                          <span className="text-xs font-bold text-accent-dark mt-1 block">
                            {formatPrice((it.product?.price || 0) * it.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Request Return Button for Delivered / Received Items */}
                      <button
                        onClick={() => {
                          setSelectedProductForReturn(it);
                          setReturnModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-accent text-slate-700 hover:text-accent-dark text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>طلب استرجاع أو صيانة</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Returns History for this Order */}
              {trackData.returns && trackData.returns.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-surface-dark shadow-sm">
                  <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2">
                    <RotateCcw size={16} className="text-accent" />
                    <span>سجل طلبات الاسترجاع والصيانة المسجلة لهذا الطلب:</span>
                  </h3>
                  <div className="space-y-2.5">
                    {trackData.returns.map((ret) => (
                      <div key={ret.id} className="p-3.5 rounded-xl bg-surface border border-surface-dark flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-primary block">#{ret.id} - {ret.productName}</span>
                          <span className="text-muted text-[11px]">السبب: {ret.reason} {ret.reasonDetails && `(${ret.reasonDetails})`}</span>
                        </div>
                        <span className="font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                          {ret.status === "pending_review" ? "قيد المراجعة الفنية" : ret.status === "inspection_approved" ? "تمت الموافقة والفحص" : ret.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Return Request Modal */}
      {returnModalOpen && selectedProductForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-surface-dark shadow-2xl relative text-start">
            <button
              onClick={() => setReturnModalOpen(false)}
              className="absolute top-5 left-5 p-2 text-muted hover:text-primary rounded-full"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-dark flex items-center justify-center shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary">طلب استرجاع أو صيانة ضمان</h3>
                <p className="text-xs text-muted">للطلب رقم #{trackData?.order.id}</p>
              </div>
            </div>

            {returnSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                <p className="font-bold text-sm">{returnSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div className="p-3 bg-surface rounded-xl border border-surface-dark text-xs">
                  <span className="text-muted block text-[10px]">القطعة المحددة:</span>
                  <strong className="text-primary font-bold text-sm">{selectedProductForReturn.product?.name}</strong>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">سبب طلب الإرجاع أو الفحص:</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value as ReturnRequest["reason"])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-xs focus:ring-2 focus:ring-accent outline-none bg-white"
                  >
                    <option value="factory_defect">عيب صناعة أو تشطيب (يشمله الضمان)</option>
                    <option value="size_mismatch">المقاس غير متطابق مع الغرفة</option>
                    <option value="color_mismatch">اختلاف درجة لون القماش أو الدهان</option>
                    <option value="shipping_damage">تلف أو خدش أثناء النقل والشحن</option>
                    <option value="customer_remorse">رغبة في التبديل بقطعة أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">تفاصيل إضافية أو وصف المشكلة:</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب أي تفاصيل توضيحية لمعاينة الفني..."
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-surface-dark text-xs focus:ring-2 focus:ring-accent outline-none resize-none"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReturnModalOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submittingReturn}
                    className="font-bold flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>{submittingReturn ? "جاري الإرسال..." : "إرسال طلب الفحص"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
