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
  { ar: "MDF إسباني عالي الكثافة معالج", en: "Treated High-Density Spanish MDF" },
  { ar: "خشب كونتر طبيعي مضغوط (Plywood)", en: "Natural Plywood (Good Wood)" },
  { ar: "خشب زان أحمر روماني طبيعي", en: "Natural Romanian Red Beech Wood" },
  { ar: "خشب ميلامين مقاوم للخدش والحرارة", en: "Scratch & Heat Resistant Melamine" },
  { ar: "ميكس خشب مع شاسيه حديد إلكتروستاتيك", en: "Wood with Electrostatic Steel Frame" },
  { ar: "أخرى / حسب ترشيح المعرض", en: "Other / Showroom Recommendation" },
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
      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Failed to upload image" : "فشل رفع الصورة"));
      }

      setReferenceImage(data.url);
    } catch (err: any) {
      setUploadError(err.message || (isEn ? "Error uploading image" : "حدث خطأ أثناء رفع الصورة"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert(isEn ? "Please enter your name and phone number." : "يرجى كتابة الاسم ورقم الهاتف على الأقل.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: Partial<CustomOrder> = {
        furnitureType,
        dimensions: {
          length: length.trim() || undefined,
          width: width.trim() || undefined,
          height: height.trim() || undefined,
          unit: "cm",
        },
        shape,
        preferredMaterial,
        preferredColor: preferredColor.trim() || undefined,
        referenceImage: referenceImage || undefined,
        notes: notes.trim() || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        city: city.trim(),
        address: address.trim() || undefined,
      };

      const response = await apiClient.post<{ success: boolean; data: CustomOrder }>(
        "/custom-orders",
        payload
      );

      const savedOrder = response.data;
      const orderId = savedOrder?.id || "ORD-" + Math.floor(100000 + Math.random() * 900000);

      const whatsappText = isEn
        ? `*New Custom Furniture Request #${orderId}*\n\n` +
          `*Name:* ${customerName}\n` +
          `*Phone:* ${customerPhone}\n` +
          `*Item:* ${furnitureType}\n` +
          `*Dimensions:* ${length || "-"} x ${width || "-"} x ${height || "-"} cm\n` +
          `*Material:* ${preferredMaterial}\n` +
          (preferredColor ? `*Color:* ${preferredColor}\n` : "") +
          (city ? `*City:* ${city}\n` : "") +
          (notes ? `*Notes:* ${notes}\n` : "") +
          (referenceImage ? `*Image:* ${referenceImage}\n\n` : "\n") +
          `Please provide a quotation for this custom request.`
        : `*طلب تفصيل أثاث مخصص رقم #${orderId}*\n\n` +
          `*الاسم:* ${customerName}\n` +
          `*الهاتف:* ${customerPhone}\n` +
          `*نوع القطعة:* ${furnitureType}\n` +
          `*المقاسات:* ${length || "-"} × ${width || "-"} × ${height || "-"} سم\n` +
          `*الخامة:* ${preferredMaterial}\n` +
          (preferredColor ? `*اللون:* ${preferredColor}\n` : "") +
          (city ? `*المدينة:* ${city}\n` : "") +
          (notes ? `*ملاحظات:* ${notes}\n` : "") +
          (referenceImage ? `*رابط الصورة المرفقة:* ${referenceImage}\n\n` : "\n") +
          `أرغب بمعرفة التكلفة التقديرية وموعد المعاينة.`;

      const whatsappUrl = `https://wa.me/201091084863?text=${encodeURIComponent(whatsappText)}`;

      setSubmittedData({
        id: orderId,
        whatsappUrl,
      });
    } catch (err) {
      console.error("Custom order submission error:", err);
      alert(isEn ? "An error occurred while saving your request. Please try again." : "حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-[#0D1017] text-slate-800 dark:text-[#F5F6F8] pb-16 pt-4">
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
            className="mt-6 bg-white dark:bg-[#151D2A] rounded-3xl p-6 sm:p-10 border border-emerald-200 dark:border-emerald-800/40 shadow-xl text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                {isEn ? "Request Received Successfully" : "تم استلام مواصفات طلبك بنجاح ✓"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 mb-2">
                {isEn ? "Thank you, your custom order is registered!" : "شكراً لك! تم تسجيل طلب التفصيل والمقاسات"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                {isEn ? (
                  <>
                    Your reference order ID is:{" "}
                    <strong className="text-slate-900 dark:text-white font-mono font-bold">#{submittedData.id}</strong>.
                    Our engineering team is calculating the cost and ideal material specs.
                  </>
                ) : (
                  <>
                    رقم طلبك المرجعي هو:{" "}
                    <strong className="text-slate-900 dark:text-white font-mono font-bold">#{submittedData.id}</strong>.
                    تم إرسال المواصفات والصور لمهندسي ورش Amazon Furniture لدراسة التكلفة وتحديد أفضل خامة.
                  </>
                )}
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
                <span>{isEn ? "Track Instant Quotation on WhatsApp" : "متابعة تفاصيل السعر فوراً عبر الواتساب"}</span>
              </a>

              <Link
                href="/"
                className="block text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold py-2 transition-colors"
              >
                {isEn ? "Back to Browse Store Catalog" : "العودة لتصفح منتجات المتجر الجاهزة"}
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
                  {isEn
                    ? "We make custom furniture easy! Enter your preferred dimensions, upload reference photos or space sketches, and our workshop engineers will reply immediately with quotation and 10-year warranty."
                    : "سهّلنا عليك كل شيء! دخل المقاسات والمساحات المتاحة عندك، وارفع صورة التصميم أو صورة المكان، وهنرد عليك فوراً بدراسة التكلفة وأفضل خامة وتحديد ميعاد المعاينة والتسليم بضمان 10 سنوات."}
                </p>

                {/* Features Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck size={16} className="text-accent shrink-0" />
                    <span>{isEn ? "Full 10-Year Warranty" : "ضمان 10 سنوات شامل"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Sparkles size={16} className="text-accent shrink-0" />
                    <span>{isEn ? "Free On-Site Measurement" : "معاينة ورفع مقاسات مجاناً"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={16} className="text-accent shrink-0" />
                    <span>{isEn ? "Quote within minutes" : "رد بالتسعير خلال دقائق"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151D2A] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
              {/* Step 1: Furniture Type */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                          ? "border-accent bg-amber-50/60 dark:bg-amber-950/20 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0D121B]"
                      }`}
                    >
                      <span className="text-2xl mb-1">{type.icon}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {isEn ? type.nameEn : type.nameAr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Dimensions & Spaces */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                    2
                  </span>
                  <span>{isEn ? "Enter Dimensions & Space (Optional & Recommended):" : "المقاسات والمساحة المطلوبة:"}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Length / Facade (e.g. 180 cm or 2.5 m)" : "الطول / الواجهة (مثال: 180 سم أو 2.5 متر)"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. 180 cm" : "مثال: 180 سم"}
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Width / Depth (e.g. 80 cm)" : "العرض / العمق (مثال: 80 سم)"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. 80 cm" : "مثال: 80 سم"}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Height (Optional - e.g. 75 cm)" : "الارتفاع (اختياري - مثال: 75 سم)"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. 75 cm" : "مثال: 75 سم"}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Shape selection */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {isEn ? "Layout Shape:" : "شكل التصميم:"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SHAPE_OPTIONS.map((s) => (
                      <label
                        key={s.id}
                        onClick={() => setShape(s.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                          shape === s.id
                            ? "bg-slate-900 dark:bg-accent text-white border-slate-900 dark:border-accent shadow-xs"
                            : "bg-slate-50 dark:bg-[#0D121B] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {isEn ? s.nameEn : s.nameAr}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Reference Image Upload */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                      3
                    </span>
                    <span>{isEn ? "Upload Reference Image / Sketch:" : "ارفع صورة التصميم أو رسم كروكي أو صورة المكان:"}</span>
                  </div>
                  {referenceImage && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {isEn ? "Image Attached" : "تم إرفاق الصورة"}
                    </span>
                  )}
                </label>

                {referenceImage ? (
                  <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-[#0D121B] border border-emerald-200 dark:border-emerald-800 shrink-0 relative">
                        <img
                          src={referenceImage}
                          alt="Uploaded Reference"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isEn ? "Design photo uploaded successfully ✓" : "تم رفع صورة التصميم بنجاح ✓"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {isEn
                            ? "Our workshop engineers will analyze details and calculate exact dimensions."
                            : "سيقوم فريق التصميم والورش بدراسة تفاصيل الصورة وحساب المقاسات بدقة."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReferenceImage("")}
                      className="p-2.5 text-rose-600 hover:bg-rose-100/70 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title={isEn ? "Delete & change photo" : "حذف وتغيير الصورة"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-accent hover:bg-amber-50/30 dark:hover:bg-amber-950/20 rounded-2xl p-6 text-center transition-all bg-white dark:bg-[#0D121B]">
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
                          <span>{isEn ? "Uploading image..." : "جاري رفع صورة التصميم..."}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-accent rounded-full mx-auto flex items-center justify-center">
                            <UploadCloud size={24} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {isEn
                                ? "Click to select a photo from your device or capture a sketch"
                                : "اضغط هنا لاختيار صورة من جهازك أو تصوير كروكي للمقاسات"}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {isEn ? "Supports (JPG, PNG, WebP) up to 20MB" : "يدعم صيغ (JPG, PNG, WebP) بحجم حتى 20 ميجابايت"}
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
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                    4
                  </span>
                  <span>{isEn ? "Materials, Colors & Special Notes:" : "الخامات والألوان والإضافات الخاصة:"}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Preferred Wood Material" : "نوع الخشب المفضل"}
                    </label>
                    <select
                      value={preferredMaterial}
                      onChange={(e) => setPreferredMaterial(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white"
                    >
                      {WOOD_MATERIALS.map((m) => (
                        <option key={m.ar} value={m.ar}>
                          {isEn ? m.en : m.ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Preferred Color or Fabric Code" : "اللون المفضل أو كود القماش"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. Oak wood with matte grey paint, or beige linen fabric" : "مثال: خشب أرو مع دهان رمادي مط، أو قماش كتان بيج"}
                      value={preferredColor}
                      onChange={(e) => setPreferredColor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {isEn
                      ? "Any additional specs (drawers, LED lighting, cable grommets, digital lock...)"
                      : "أي مواصفات إضافية (أدراج، إضاءة LED، فتحات كابلات، قفل إلكتروني...)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      isEn
                        ? "Enter any other details to focus on during manufacturing and assembly..."
                        : "اكتب أي تفاصيل أخرى تحب نركز عليها أثناء التصنيع والتجميع..."
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none resize-none"
                  />
                </div>
              </div>

              {/* Step 5: Customer Contact Info */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold">
                    5
                  </span>
                  <span>{isEn ? "Your Contact Information:" : "بيانات التواصل للرد عليك بالعرض والتفاصيل:"}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Full Name *" : "الاسم بالكامل *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? "John Doe" : "محمد أحمد"}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Phone / WhatsApp *" : "رقم الهاتف / الواتساب *"}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Governorate & City" : "المحافظة والمدينة"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. Cairo - New Cairo" : "مثال: القاهرة - التجمع الخامس"}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Email Address (Optional)" : "البريد الإلكتروني (اختياري)"}
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Street Address (Optional)" : "العنوان بالتفصيل (اختياري)"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "Street name, building or villa number..." : "اسم الشارع، رقم العمارة أو الفيلا..."}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121B] text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent text-xs outline-none"
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
                    {submitting
                      ? isEn
                        ? "Submitting custom order..."
                        : "جاري تسجيل الطلب وإرسال المواصفات..."
                      : isEn
                      ? "Submit Custom Order & Get Instant Quote"
                      : "إرسال طلب التفصيل ومتابعة الرد فوراً"}
                  </span>
                </button>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2.5">
                  {isEn
                    ? "🛡️ Our engineering team will review the photos and dimensions to prepare your exact quotation."
                    : "🛡️ سيتم التواصل معك بمجرد مراجعة فريق المهندسين للصور والمقاسات لتقديم التكلفة الدقيقة."}
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
