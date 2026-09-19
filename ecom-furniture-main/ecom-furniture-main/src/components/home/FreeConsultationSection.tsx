"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Navigation,
  Loader2,
  X,
  AlertCircle,
  Home,
} from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLanguageStore } from "@/store/languageStore";

export default function FreeConsultationSection() {
  const { language } = useLanguageStore();
  const isEn = language === "en";

  const [consultType, setConsultType] = useState<"mansoura" | "online">("mansoura");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [spaceType, setSpaceType] = useState("شركة ومكاتب إدارية");
  const [preferredTime, setPreferredTime] = useState("خلال يومين");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastWaUrl, setLastWaUrl] = useState("");

  const showroomMapsUrl = "https://maps.app.goo.gl/NP3m16vbWodtcp9c8?g_st=ic";

  // Automatic GPS Geolocation Detection
  const handleGetLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("متصفحك لا يدعم تحديد الموقع التلقائي. يمكنك لصق رابط الخريطة يدوياً.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        setGoogleMapsUrl(mapsLink);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("يرجى السماح بصلاحية الوصول للموقع في المتصفح، أو يمكنك نسخ رابط موقعك من تطبيق Google Maps ولصقه هنا.");
        } else {
          setLocationError("تعذر التقاط الموقع بدقة حالياً. يرجى لصق الرابط يدوياً.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const consultTypeText =
      consultType === "mansoura"
        ? "معاينة ميدانية مجانية داخل المنصورة 📍"
        : "ميتنج فيديو أونلاين (Zoom / Meet / WhatsApp) 💻";

    // Format WhatsApp message with all required data including address and Google Maps location
    const msg = `👋 *طلب استشارة مجانية وتجهيز أثاث — Amazon Furniture*
━━━━━━━━━━━━━━━━━━━━
👤 *الاسم الكريم:* ${fullName.trim() || "عميل كريم"}
📞 *رقم الهاتف / الواتساب:* ${phone.trim()}
📍 *نوع الاستشارة المطلوبة:* ${consultTypeText}
🏠 *العنوان بالتفصيل:* ${address.trim() || "سيتم توضيحه هاتفياً"}
${googleMapsUrl ? `🗺️ *رابط اللوكيشن (Google Maps):* ${googleMapsUrl}\n` : ""}🏢 *نوع المكان المطلوب فرشه:* ${spaceType}
🗓️ *الوقت واليوم المفضل:* ${preferredTime}
${notes ? `📝 *ملاحظات وتفاصيل خاصة:* ${notes.trim()}\n` : ""}━━━━━━━━━━━━━━━━━━━━
مرحباً أستاذ محمد إسماعيل، أرسلت لكم تفاصيل موقعي وعنواني لحجز موعد المعاينة والاستشارة المجانية وتحديد أنسب خامات الأثاث والميزانية.`;

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/201091084863?text=${encoded}`;
    setLastWaUrl(waUrl);

    // Save to backend database for administrative tracking
    try {
      await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          consultType,
          address,
          googleMapsUrl,
          spaceType,
          preferredTime,
          notes,
        }),
      });
    } catch {
      // Continue even if backend call is delayed
    }

    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
  };

  return (
    <section id="consultation" className="py-20 bg-surface/40 relative overflow-hidden border-t border-surface-dark">
      {/* Background glow effects */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#C5A880]/15 text-[#8B6E45] border border-[#C5A880]/30 mb-3">
            <Sparkles size={14} className="text-[#8B6E45]" />
            <span>خدمة استثنائية مجانية 100% بدون أي رسوم</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
            {isEn ? "Free Furniture & Design Consultation" : "استشارة مجانية بالكامل لتجهيز مساحتك"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            {isEn
              ? "Confused about what furniture to choose? We help you plan, measure, and select the ideal woods, chairs, desks, and blinds for your office or home — with zero fees!"
              : "محتار تبدأ منين؟ بنساعدك تختار أفضل موديلات كراسي المكاتب، الجيمينج، المكاتب، الركن، والستائر الأنسب لمساحتك وميزانيتك عشان تقرر براحتك وبدون أي التزام مالي."}
          </p>
        </AnimatedSection>

        {/* 2 Options Cards: Mansoura Visit vs Online Meeting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Inside Mansoura */}
          <AnimatedSection delay={0.1}>
            <div
              onClick={() => setConsultType("mansoura")}
              className={`p-6 sm:p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative h-full flex flex-col justify-between ${
                consultType === "mansoura"
                  ? "bg-white border-[#C5A880] shadow-xl ring-4 ring-[#C5A880]/15 scale-[1.01]"
                  : "bg-white/80 border-surface-dark hover:border-[#C5A880]/50 hover:bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <MapPin size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    معاينة مجانية 100%
                  </span>
                </div>

                <h3 className="text-xl font-bold text-primary mb-2">
                  داخل المنصورة — زيارة ومعاينة ميدانية مجانية
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  لو مكانك أو شركتك أو عيادتك في المنصورة، بنجيلك لحد عندك نقيس المساحة، ونعرض عليك عينات خامات الأخشاب والستائر والأقمشة، ونقترح عليك أفضل فرش وتوزيع للمكاتب والكراسي مجاناً.
                </p>

                <ul className="space-y-2 text-xs font-medium text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>رفع المقاسات وأبعاد الغرف والشبابيك بالمللي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>معاينة حية لعينات الخشب الزان والميلامين والأقمشة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>تحديد أفضل أنواع الستائر (رول / زيبرا / معدنية)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>التركيب والمعاينة مجاناً 100% مع الأستاذ محمد إسماعيل</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-surface-dark flex items-center justify-between text-xs">
                <span className="font-bold text-[#8B6E45]">
                  {consultType === "mansoura" ? "✓ تم اختيار هذا الخيار" : "اضغط لاختيار هذا النوع"}
                </span>
                <span className="text-muted">المنصورة وضواحيها</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Card 2: Outside Mansoura (Online Meeting) */}
          <AnimatedSection delay={0.2}>
            <div
              onClick={() => setConsultType("online")}
              className={`p-6 sm:p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative h-full flex flex-col justify-between ${
                consultType === "online"
                  ? "bg-white border-[#C5A880] shadow-xl ring-4 ring-[#C5A880]/15 scale-[1.01]"
                  : "bg-white/80 border-surface-dark hover:border-[#C5A880]/50 hover:bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Video size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    أونلاين لجميع المحافظات والدول
                  </span>
                </div>

                <h3 className="text-xl font-bold text-primary mb-2">
                  خارج المنصورة — جلسة واجتماع فيديو أونلاين (ميتنج)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  لو كنت خارج المنصورة (القاهرة، الجيزة، الإسكندرية، أو في السعودية والخليج)، بنعمل معاك ميتنج فيديو عبر Zoom أو Google Meet أو واتساب لمناقشة صور ومخطط مساحتك وعرض أحدث الكتالوجات.
                </p>

                <ul className="space-y-2 text-xs font-medium text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>مناقشة صور ومخطط مساحتك وتحديد الاحتياجات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>عرض فيديو حي لمنتجات المعرض والألوان المتاحة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>اقتراح كراسي طبية وجيمينج ومكاتب ملائمة لميزانيتك</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>شحن وتوصيل آمن لباب البيت أو المقر مع ضمان شامل</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-surface-dark flex items-center justify-between text-xs">
                <span className="font-bold text-[#8B6E45]">
                  {consultType === "online" ? "✓ تم اختيار هذا الخيار" : "اضغط لاختيار هذا النوع"}
                </span>
                <span className="text-muted">مصر والمملكة العربية السعودية</span>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Location Card & Booking Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Showroom Location Card (5 Cols) */}
          <AnimatedSection delay={0.3} className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-surface-dark shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-dark">
                <div className="w-12 h-12 rounded-2xl bg-[#C5A880]/15 text-[#8B6E45] flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#8B6E45] uppercase">
                    معرض ومصنع Amazon Furniture
                  </span>
                  <h4 className="text-lg font-bold text-primary">
                    موقعنا في المنصورة، الدقهلية
                  </h4>
                </div>
              </div>

              {/* Map Preview Box */}
              <div className="relative rounded-2xl overflow-hidden border border-surface-dark bg-slate-100 aspect-video flex flex-col items-center justify-center text-center p-6 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"
                  alt="Amazon Furniture Mansoura Showroom"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-20 text-white space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-primary flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <MapPin size={24} className="text-red-600" />
                  </div>
                  <p className="text-sm font-bold text-white drop-shadow">
                    معرض ومصنع الأثاث المكتبي والمنزلي
                  </p>
                  <p className="text-xs text-white/90 drop-shadow">
                    المنصورة، محافظة الدقهلية، جمهورية مصر العربية
                  </p>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface">
                  <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-primary block">العنوان الدقيق:</span>
                    <span>المنصورة، الدقهلية — متاح استقبالكم ومعاينة جميع الكراسي والمكاتب على الطبيعة.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface">
                  <Clock size={16} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-primary block">مواعيد العمل والمعاينة:</span>
                    <span>يومياً من الساعة 10:00 صباحاً حتى 11:00 مساءً.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface">
                  <Phone size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-primary block">مدير المعرض:</span>
                    <span dir="ltr" className="font-bold text-slate-900 block mt-0.5">
                      أ. محمد إسماعيل (+20 109 1084863)
                    </span>
                  </div>
                </div>
              </div>

              {/* Open Google Maps Button */}
              <a
                href={showroomMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>افتح لوكيشن المعرض في خرائط Google Maps</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </AnimatedSection>

          {/* Consultation Form (7 Cols) */}
          <AnimatedSection delay={0.4} className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-dark shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-surface-dark">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary">
                    احجز استشارتك المجانية الآن
                  </h4>
                  <p className="text-xs text-muted">
                    سجل بياناتك وموقعك وسيتواصل معك أ. محمد إسماعيل فوراً لتأكيد المعاينة.
                  </p>
                </div>
              </div>

              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h5 className="text-xl font-bold text-primary">
                    تم إرسال طلب الاستشارة واللوكيشن بنجاح!
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    تم تجهيز كافة بياناتك وعنوانك ولوكيشن خريطتك وفتح محادثة الواتساب مع الأستاذ محمد إسماعيل (+20 109 1084863).
                  </p>

                  {lastWaUrl && (
                    <a
                      href={lastWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all mt-2"
                    >
                      <MessageCircle size={18} />
                      <span>فتح محادثة الواتساب مجدداً</span>
                    </a>
                  )}

                  <div>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold text-[#8B6E45] underline mt-3 hover:text-[#705634]"
                    >
                      حجز استشارة أخرى لمكان آخر
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Switcher in Form */}
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5">
                      مكان الاستشارة المطلوب:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setConsultType("mansoura")}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          consultType === "mansoura"
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-surface border-surface-dark text-slate-700 hover:border-[#C5A880]"
                        }`}
                      >
                        <MapPin size={16} />
                        <span>معاينة في المنصورة 📍</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultType("online")}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          consultType === "online"
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-surface border-surface-dark text-slate-700 hover:border-[#C5A880]"
                        }`}
                      >
                        <Video size={16} />
                        <span>ميتنج أونلاين فيديو 💻</span>
                      </button>
                    </div>
                  </div>

                  {/* Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">
                        الاسم بالكامل <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثال: أحمد محمود"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">
                        رقم الهاتف / الواتساب <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01X XXXX XXXX / +966..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Detailed Address Field */}
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
                      <Home size={14} className="text-accent" />
                      <span>العنوان بالتفصيل للمعاينة <span className="text-danger">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="مثال: المنصورة - شارع الجيش - برج الصفوة الدور الرابع - شقة 8"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      اكتب المدينة والشارع ورقم المبنى أو علامة مميزة ليسهل على فريق المعاينة الوصول إليك.
                    </p>
                  </div>

                  {/* Google Maps Location Section */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <MapPin size={15} className="text-red-500" />
                        <span>لوكيشن الموقع على خرائط Google Maps:</span>
                      </label>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                        موصى به لوصول أدق
                      </span>
                    </div>

                    {/* Quick GPS Geolocation Button */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 size={15} className="animate-spin text-amber-400" />
                            <span>جاري التقاط إحداثيات موقعك بدقة...</span>
                          </>
                        ) : (
                          <>
                            <Navigation size={15} className="text-amber-400" />
                            <span>📍 اضغط لتحديد موقعي الحالي تلقائياً (GPS)</span>
                          </>
                        )}
                      </button>

                      <a
                        href="https://www.google.com/maps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>فتح Google Maps</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    {locationError && (
                      <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{locationError}</span>
                      </div>
                    )}

                    {/* Manual Link Input / Captured Preview */}
                    <div className="relative">
                      <input
                        type="url"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        placeholder="أو الصق رابط موقعك من Google Maps هنا (https://maps.app.goo.gl/...)"
                        className="w-full px-3.5 py-2 rounded-xl border border-surface-dark text-xs bg-white focus:outline-none focus:ring-2 focus:ring-accent ltr text-left"
                      />
                      {googleMapsUrl && (
                        <button
                          type="button"
                          onClick={() => setGoogleMapsUrl("")}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          title="مسح الرابط"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {googleMapsUrl && (
                      <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          <span>تم إدراج رابط الموقع بنجاح وسيرسل للأستاذ محمد إسماعيل</span>
                        </div>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 underline font-bold flex items-center gap-1 hover:text-emerald-900"
                        >
                          <span>معاينة الرابط</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Space Type & Preferred Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">
                        نوع المكان المطلوب فرشه:
                      </label>
                      <select
                        value={spaceType}
                        onChange={(e) => setSpaceType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="شركة ومكاتب إدارية">شركة ومكاتب إدارية</option>
                        <option value="مكتب منزلي شخصي">مكتب منزلي شخصي (Home Office)</option>
                        <option value="كراسي جيمينج وألعاب">كراسي جيمينج وألعاب احترافية</option>
                        <option value="عيادة طبية أو مركز">عيادة طبية أو مركز</option>
                        <option value="ركنة صالون واستقبال">ركنة صالون واستقبال فاخرة</option>
                        <option value="ستائر مكتبية متكاملة">ستائر مكتبية (رول / زيبرا / معدنية)</option>
                        <option value="تأثيث مقر كامل">تأثيث مقر كامل متكامل</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">
                        الموعد المفضل:
                      </label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-dark text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="اليوم (في أقرب وقت ممكن)">اليوم (في أقرب وقت ممكن)</option>
                        <option value="غداً صباحاً (11 ص - 3 م)">غداً صباحاً (11 ص - 3 م)</option>
                        <option value="غداً مساءً (5 م - 9 م)">غداً مساءً (5 م - 9 م)</option>
                        <option value="خلال نهاية الأسبوع">خلال نهاية الأسبوع</option>
                        <option value="موعد يتم تحديده عبر الواتساب">موعد يتم تحديده عبر الواتساب</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5">
                      ملاحظات أو مواصفات خاصة ترغب بمناقشتها (اختياري):
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="مثال: محتاج كراسي مكتب مريحة جداً لـ 6 موظفين مع ستائر رول عازلة للشمس..."
                      className="w-full px-3.5 py-2 rounded-xl border border-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all"
                  >
                    <MessageCircle size={22} />
                    <span>تأكيد حجز الاستشارة وإرسال العنوان والموقع عبر الواتساب</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>خدمة استشارية مجانية 100% بدون أي رسوم أو التزام بالشراء.</span>
                  </div>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
