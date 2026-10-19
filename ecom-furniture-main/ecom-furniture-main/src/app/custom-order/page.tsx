"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Ruler,
  UploadCloud,
  CheckCircle2,
  Trash2,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { apiClient } from "@/lib/apiClient";
import type { CustomOrder } from "@/types";
import Breadcrumb from "@/components/layout/Breadcrumb";

const FURNITURE_TYPES = [
  { id: "office_desk", nameAr: "مكتب عمل / مديرين", nameEn: "Office / Executive Desk", icon: "💼" },
  { id: "living_corner", nameAr: "ركنة / مجلس مودرن", nameEn: "Modern Living / Corner Sofa", icon: "🛋️" },
  { id: "dressing_room", nameAr: "دريسنج روم / دولاب", nameEn: "Dressing Room / Wardrobe", icon: "🚪" },
  { id: "kitchen", nameAr: "مطبخ مودرن عمولة", nameEn: "Custom Modern Kitchen", icon: "🍳" },
  { id: "bedroom", nameAr: "غرفة نوم كاملة / سرير", nameEn: "Bedroom Set / Bed", icon: "🛏️" },
  { id: "table", nameAr: "ترابيزة شاشة / قهوة / سفرة", nameEn: "TV / Coffee / Dining Table", icon: "🪵" },
  { id: "library", nameAr: "مكتبة حائط ووحدات تخزين", nameEn: "Wall Shelving & Storage", icon: "📚" },
  { id: "other", nameAr: "قطعة أثاث مخصصة أخرى", nameEn: "Other Custom Furniture", icon: "✨" },
];

const SHAPE_OPTIONS = [
  { id: "straight", nameAr: "مستقيم (I-Shape)", nameEn: "Straight (I-Shape)" },
  { id: "l_shape", nameAr: "زاوية حرف L (L-Shape)", nameEn: "L-Shape Corner" },
  { id: "u_shape", nameAr: "شكل حرف U (U-Shape)", nameEn: "U-Shape" },
  { id: "custom_shape", nameAr: "شكل حر / حسب الرسم الكروكي", nameEn: "Custom / As per Sketch" },
];

const WOOD_MATERIALS = [
  "MDF إسباني عالي الكثافة معالج",
  "خشب كونتر طبيعي مضغوط (Plywood)",
  "خشب زان أحمر روماني طبيعي",
  "خشب ميلامين مقاوم للخدش والحرارة",
  "ميكس خشب مع شاسيه حديد إلكتروستاتيك",
  "أخرى / حسب ترشيح المعرض",
];

export default function CustomOrderPage() {
  const { language } = useLanguageStore();
  const isEn = language === "en";

  // Form State
  const [furnitureType, setFurnitureType] = useState<string>("مكتب عمل / مديرين");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [shape, setShape] = useState("straight");
  const [preferredMaterial, setPreferredMaterial] = useState("MDF إسباني عالي الكثافة معالج");
  const [preferredColor, setPreferredColor] = useState("");
  const [notes, setNotes] = useState("");

  // Customer Contact State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [city, setCity] = useState("القاهرة والجيزة");
  const [address, setAddress] = useState("");

  // Upload Reference Image State
  const [referenceImage, setReferenceImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    whatsappUrl: string;
  } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(isEn ? "Please upload an image (PNG, JPG, WebP)" : "يرجى اختيار ملف صورة صالح");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError(isEn ? "File size must be under 20MB" : "حجم الصورة يجب ألا يتعدى 20 ميجابايت");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setReferenceImage(data.url);
      } else {
        setUploadError(data.error || "فشل رفع الصورة، يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("حدث خطأ أثناء رفع الصورة.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert(isEn ? "Please fill in your name and phone number." : "يرجى كتابة الاسم ورقم الهاتف للتواصل.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        city: city.trim(),
        address: address.trim(),
        furnitureType,
        dimensions: {
          length: length.trim(),
          width: width.trim(),
          height: height.trim(),
          shape,
        },
        preferredMaterial,
        preferredColor: preferredColor.trim(),
        notes: notes.trim(),
        referenceImage,
      };

      const res = await apiClient.createCustomOrder(payload);

      const createdId = (res as { customOrder?: CustomOrder })?.customOrder?.id || `CST-${Math.floor(100000 + Math.random() * 900000)}`;

      // Construct WhatsApp message
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const fullImgUrl = referenceImage
        ? referenceImage.startsWith("http")
          ? referenceImage
          : `${origin}${referenceImage}`
        : "";

      const shapeLabel = SHAPE_OPTIONS.find((s) => s.id === shape)?.nameAr || shape;

      const whatsappText = `📐 *طلب تفصيل وتصنيع أثاث بمقاسات خاصة*
━━━━━━━━━━━━━━━━━━━━
🏷️ *رقم الطلب:* #${createdId}
👤 *اسم العميل:* ${customerName}
📞 *رقم الهاتف:* ${customerPhone}
📍 *المحافظة / المدينة:* ${city}
━━━━━━━━━━━━━━━━━━━━
🛋️ *نوع القطعة:* ${furnitureType}
📏 *المقاسات المحددة:*
• الطول: ${length || "حسب المعاينة"}
• العرض / العمق: ${width || "حسب المعاينة"}
• الارتفاع: ${height || "قياسي"}
• شكل التصميم: ${shapeLabel}

🪵 *الخامة المفضلة:* ${preferredMaterial}
🎨 *اللون المطلوب:* ${preferredColor || "حسب الكتالوج"}
${notes ? `📝 *ملاحظات وإضافات:* ${notes}\n` : ""}${
        fullImgUrl ? `🖼️ *صورة التصميم أو المكان:* ${fullImgUrl}\n` : ""
      }━━━━━━━━━━━━━━━━━━━━
مرحباً فريق Amazon Furniture، قمت بتسجيل بيانات التفصيل عبر الموقع وأرجو إفادتي بالتكلفة وموعد المعاينة والتنفيذ.`;

      const whatsappUrl = `https://wa.me/201091084863?text=${encodeURIComponent(whatsappText)}`;

      setSubmittedData({
        id: createdId,
        whatsappUrl,
      });
    } catch (err) {
      console.error("Custom order submission error:", err);
      alert("حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light text-slate-800 pb-16 pt-4">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "الرئيسية", href: "/" },
            { label: isEn ? "Custom Furniture" : "تفصيل وتصنيع بالمقاسات الخاصة" },
          ]}
        />

        {submittedData ? (
          /* Success Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {isEn ? "Request Received Successfully" : "تم استلام مواصفات طلبك بنجاح ✓"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-2">
                {isEn ? "Thank you, your custom order is registered!" : "شكراً لك! تم تسجيل طلب التفصيل والمقاسات"}
              </h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                رقم طلبك المرجعي هو:{" "}
                <strong className="text-slate-900 font-mono font-bold">#{submittedData.id}</strong>.
                تم إرسال المواصفات والصور لمهندسي ورش Amazon Furniture لدراسة التكلفة وتحديد أفضل خامة.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 max-w-md mx-auto space-y-3">
              <a
                href={submittedData.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <MessageCircle size={22} />
                <span>متابعة تفاصيل السعر فوراً عبر الواتساب</span>
              </a>

              <Link
                href="/"
                className="block text-xs text-slate-500 hover:text-slate-900 font-semibold py-2 transition-colors"
              >
                العودة لتصفح منتجات المتجر الجاهزة
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Main Interactive Custom Furniture Form */
          <div className="mt-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 end-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent-light text-xs font-bold">
                  <Ruler size={14} />
                  <span>{isEn ? "Custom Tailored Furniture" : "خدمة التصنيع والتفصيل المخصص"}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                  {isEn
                    ? "Have a Specific Desk, Sofa, or Space? We Craft It For You!"
                    : "معاك صورة لمكتب أو ركنة أو دريسنج بمقاسات معينة؟ نفذه فوراً بأعلى جودة"}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  سهّلنا عليك كل شيء! دخل المقاسات والمساحات المتاحة عندك، وارفع صورة التصميم أو صورة المكان،
                  وهنرد عليك فوراً بدراسة التكلفة وأفضل خامة وتحديد ميعاد المعاينة والتسليم بضمان 10 سنوات.
                </p>

                {/* Features Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck size={16} className="text-accent shrink-0" />
                    <span>ضمان 10 سنوات شامل</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Sparkles size={16} className="text-accent shrink-0" />
                    <span>معاينة ورفع مقاسات مجاناً</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={16} className="text-accent shrink-0" />
                    <span>رد بالتسعير خلال دقائق</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
              {/* Step 1: Furniture Type */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                    1
                  </span>
                  <span>{isEn ? "Select Furniture Category" : "حدد نوع القطعة المطلوب تفصيلها:"}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FURNITURE_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setFurnitureType(type.nameAr)}
                      className={`p-3 rounded-2xl border-2 text-start transition-all cursor-pointer flex flex-col justify-between ${
                        furnitureType === type.nameAr
                          ? "border-accent bg-amber-50/60 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl mb-1">{type.icon}</span>
                      <span className="text-xs font-bold text-slate-900">
                        {isEn ? type.nameEn : type.nameAr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Dimensions & Spaces */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                    2
                  </span>
                  <span>{isEn ? "Enter Dimensions & Space (Optional & Recommended)" : "المقاسات والمساحة المطلوبة:"}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      الطول / الواجهة (مثال: 180 سم أو 2.5 متر)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 180 سم"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      العرض / العمق (مثال: 80 سم)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 80 سم"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      الارتفاع (اختياري - مثال: 75 سم)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 75 سم"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Shape selection */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    شكل التصميم:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SHAPE_OPTIONS.map((s) => (
                      <label
                        key={s.id}
                        onClick={() => setShape(s.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                          shape === s.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {isEn ? s.nameEn : s.nameAr}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Reference Image Upload */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                      3
                    </span>
                    <span>{isEn ? "Upload Reference Image / Sketch" : "ارفع صورة التصميم أو رسم كروكي أو صورة المكان:"}</span>
                  </div>
                  {referenceImage && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      تم إرفاق الصورة
                    </span>
                  )}
                </label>

                {referenceImage ? (
                  <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-emerald-200 shrink-0 relative">
                        <img
                          src={referenceImage}
                          alt="Uploaded Reference"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          تم رفع صورة التصميم بنجاح ✓
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          سيقوم فريق التصميم والورش بدراسة تفاصيل الصورة وحساب المقاسات بدقة.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReferenceImage("")}
                      className="p-2.5 text-rose-600 hover:bg-rose-100/70 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title="حذف وتغيير الصورة"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 hover:border-accent hover:bg-amber-50/30 rounded-2xl p-6 text-center transition-all bg-white">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                      />
                      {uploadingImage ? (
                        <div className="flex items-center justify-center gap-2 py-2 text-xs text-accent font-bold">
                          <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          <span>جاري رفع صورة التصميم...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-amber-50 text-accent rounded-full mx-auto flex items-center justify-center">
                            <UploadCloud size={24} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              اضغط هنا لاختيار صورة من جهازك أو تصوير كروكي للمقاسات
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              يدعم صيغ (JPG, PNG, WebP) بحجم حتى 20 ميجابايت
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                )}

                {uploadError && (
                  <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
                )}
              </div>

              {/* Step 4: Materials, Colors, and Extra Notes */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                    4
                  </span>
                  <span>{isEn ? "Materials, Colors & Special Notes" : "الخامات والألوان والإضافات الخاصة:"}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      نوع الخشب المفضل
                    </label>
                    <select
                      value={preferredMaterial}
                      onChange={(e) => setPreferredMaterial(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none bg-white"
                    >
                      {WOOD_MATERIALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      اللون المفضل أو كود القماش
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: خشب أرو مع دهان رمادي مط، أو قماش كتان بيج"
                      value={preferredColor}
                      onChange={(e) => setPreferredColor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    أي مواصفات إضافية (أدراج، إضاءة LED، فتحات كابلات، قفل إلكتروني...)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="اكتب أي تفاصيل أخرى تحب نركز عليها أثناء التصنيع والتجميع..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none resize-none"
                  />
                </div>
              </div>

              {/* Step 5: Customer Contact Info */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                    5
                  </span>
                  <span>{isEn ? "Your Contact Information" : "بيانات التواصل للرد عليك بالعرض والتفاصيل:"}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="محمد أحمد"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      رقم الهاتف / الواتساب *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      المحافظة والمدينة
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: القاهرة - التجمع الخامس"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      البريد الإلكتروني (اختياري)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      العنوان بالتفصيل (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="اسم الشارع، رقم العمارة أو الفيلا..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="w-full py-4 px-6 rounded-2xl bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <Sparkles size={20} />
                  <span>
                    {submitting ? "جاري تسجيل الطلب وإرسال المواصفات..." : "إرسال طلب التفصيل ومتابعة الرد فوراً"}
                  </span>
                </button>

                <p className="text-[11px] text-slate-500 text-center mt-2.5">
                  🛡️ سيتم التواصل معك بمجرد مراجعة فريق المهندسين للصور والمقاسات لتقديم التكلفة الدقيقة.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
