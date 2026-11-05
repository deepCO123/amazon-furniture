"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Send,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export default function NewShowroomConsultationSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    dimensions: "",
    consultationType: "تجهيز مكتب أو مقر شركة",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus("error");
      setErrorMessage("يرجى إدخال الاسم ورقم الهاتف على الأقل");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await apiClient.createConsultation({
        fullName: formData.name.trim(),
        phone: formData.phone.trim(),
        consultType: "mansoura",
        spaceType: formData.consultationType,
        address: "طلب استشارة من الموقع الرئيسي - المنصورة",
        preferredTime: "خلال أوقات العمل",
        notes:
          [
            formData.notes.trim(),
            formData.company ? "الشركة: " + formData.company : "",
            formData.dimensions ? "المساحة: " + formData.dimensions + " م2" : "",
            formData.email.trim() ? "البريد: " + formData.email.trim() : "",
          ]
            .filter(Boolean)
            .join(" - ") || undefined,
        status: "new",
      });

      if (res && res.success !== false) {
        setStatus("success");
        setFormData({
          name: "",
          phone: "",
          email: "",
          company: "",
          dimensions: "",
          consultationType: "تصميم داخلي 3D",
          notes: "",
        });
      } else {
        setStatus("error");
        setErrorMessage(
          (res as { message?: string })?.message ||
            "حدث خطأ أثناء إرسال طلب الاستشارة"
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="consultation" className="relative w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-8 sm:py-14 overflow-hidden">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Main Unified 3-Zone Container matching reference design ── */}
        <div className="rounded-3xl shadow-xl overflow-hidden border border-[#EBE7DF] dark:border-[#38261A] bg-white dark:bg-[#1A1410]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* ════════════ ZONE 1 (RIGHT): Location & Video Tour (42% / 5 cols) ════════════ */}
            <div className="lg:col-span-5 bg-[#1F1A17] text-white p-5 sm:p-7 flex flex-col justify-between order-1 relative z-10">
              {/* Header: Title + Subtitle + Gold Map Pin Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-right">
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    موقعنا في المنصورة
                  </h3>
                  <p className="text-xs text-[#D4A373] font-medium mt-0.5">
                    زورونا في معرضنا الرئيسي
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#E8D4B0] text-[#1F1A17] flex items-center justify-center shrink-0 shadow-md">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
              </div>

              {/* Showroom Facade Preview with Centered Glassmorphism Play Button */}
              <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/10 group mb-4 shadow-lg">
                <Image
                  src="/redesign/showroom-facade.jpg"
                  alt="معرض Amazon Furniture بالمنصورة"
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1F1A17] shadow-2xl transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                    aria-label="تشغيل فيديو المعرض"
                  >
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Address & Working Hours Details */}
              <div className="space-y-2.5 mb-5 text-xs sm:text-[13px] font-semibold text-white/95 text-right">
                <div className="flex items-center justify-end gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="leading-snug">العنوان: المنصورة: 52 شارع سامية الجمل، قسم ثان (أمازون للأثاث المكتبي والتجهيزات)</span>
                  <MapPin className="w-4 h-4 text-[#E8D4B0] shrink-0" />
                </div>
                <div className="flex items-center justify-end gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="leading-snug">مواعيد العمل: يومياً من 10:00 صباحاً حتى 11:00 مساءً</span>
                  <Clock className="w-4 h-4 text-[#E8D4B0] shrink-0" />
                </div>
              </div>

              {/* Google Maps Button */}
              <a
                href="https://www.google.com/maps/place/%D8%A7%D9%85%D8%A7%D8%B2%D9%88%D9%86+%D9%84%D9%84%D8%A7%D8%AB%D8%A7%D8%AB+%D8%A7%D9%84%D9%85%D9%83%D8%AA%D8%A8%D9%8A+%D9%88%D8%A7%D9%84%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%D8%A7%D8%AA%E2%80%AD/@31.0318629,31.3619766,17z/data=!4m6!3m5!1s0x14f79d9d9c5eed19:0x3d5d67c0dfa6fa5e!8m2!3d31.0318603!4d31.3645535!16s%2Fg%2F11fqxyhm9m?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#2C211C] hover:bg-[#3D2C22] active:scale-[0.99] border border-white/10 text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <MapPin className="w-4 h-4 text-[#E8D4B0]" />
                <span>عرض الموقع على خرائط جوجل</span>
              </a>
            </div>

            {/* ════════════ ZONE 2 (CENTER): Consultation Visual & Guarantees (28% / 3.5 cols) ════════════ */}
            <div className="lg:col-span-3 bg-[#2B2019] text-white relative min-h-[360px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-7 order-2 overflow-hidden border-t lg:border-t-0 border-white/10">
              {/* Luxury Armchair Background with Warm Gradient Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/redesign/consultation-armchair-clean.jpg"
                  alt="استشارة مجانية"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F150F]/95 via-[#2B2019]/85 to-[#382619]/90" />
              </div>

              {/* Top VIP Badge & Typography */}
              <div className="relative z-10 text-right">
                <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-[#F7E7CE] text-[11px] font-bold px-3.5 py-1 rounded-full border border-white/20 mb-3 sm:mb-4 shadow-sm">
                  <span>خدمة VIP مجانية</span>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-2 drop-shadow-md">
                  احجز استشارتك الآن
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium drop-shadow">
                  للحصول على أفضل نصيحة لاختيار الأثاث المناسب لمنزلك أو مكتبك
                </p>
              </div>

              {/* Bottom Guarantees Checkmarks */}
              <div className="relative z-10 mt-auto pt-6 space-y-2 text-right text-xs font-bold text-white/95">
                <div className="flex items-center justify-end gap-2">
                  <span>معاينة داخل المنصورة</span>
                  <span className="text-[#E8D4B0] font-black">✓</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span>رفع مقاسات وتصميم ثلاثي الأبعاد</span>
                  <span className="text-[#E8D4B0] font-black">✓</span>
                </div>
              </div>
            </div>

            {/* ════════════ ZONE 3 (LEFT): Multi-Input Booking Form (30% / 4 cols) ════════════ */}
            <div className="lg:col-span-4 bg-white dark:bg-[#1C1612] p-6 sm:p-8 flex flex-col justify-between order-3 border-t lg:border-t-0 border-[#EBE7DF] dark:border-[#38261A]">
              <div className="mb-4 text-right">
                <h3 className="text-lg sm:text-2xl font-black text-[#1F1A17] dark:text-[#FAF4ED] leading-tight">
                  احجز استشارتك المجانية الآن
                </h3>
              </div>

              {status === "success" ? (
                <div className="bg-[#EBFBEE] dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/50 rounded-2xl p-6 text-center my-auto">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                    تم استلام طلبك بنجاح!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    سيتواصل معك مهندس الديكور والاستشارات لتأكيد الموعد والمعاينة.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {status === "error" && (
                    <div className="bg-[#FFF5F5] dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-2.5 flex items-center justify-end gap-2 text-xs text-red-700 dark:text-red-300">
                      <span>{errorMessage}</span>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    </div>
                  )}

                  {/* Row 1: Name & Phone (2-col grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Name */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="الاسم بالكامل"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full bg-[#FAF8F5] dark:bg-[#231A14] border border-[#E8E4DC] dark:border-[#38261A] rounded-full px-4 py-2.5 pl-10 text-xs font-medium text-[#201815] dark:text-white placeholder:text-[#9E948A] focus:outline-none focus:border-[#8B5E3C] transition-colors text-right"
                      />
                      <User className="w-4 h-4 text-[#8B5E3C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="رقم الهاتف"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        className="w-full bg-[#FAF8F5] dark:bg-[#231A14] border border-[#E8E4DC] dark:border-[#38261A] rounded-full px-4 py-2.5 pl-10 text-xs font-medium text-[#201815] dark:text-white placeholder:text-[#9E948A] focus:outline-none focus:border-[#8B5E3C] transition-colors text-right"
                      />
                      <Phone className="w-4 h-4 text-[#8B5E3C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                                    {/* Row: Company & Space Dimensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="اسم الشركة / المؤسسة"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className="w-full bg-[#FAF8F5] dark:bg-[#231A14] border border-[#E8E4DC] dark:border-[#38261A] rounded-full px-4 py-2.5 text-xs font-medium text-[#201815] dark:text-white placeholder:text-[#9E948A] focus:outline-none focus:border-[#C59B63] transition-colors text-right"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="المساحة التقريبية (متر مربع)"
                        value={formData.dimensions}
                        onChange={(e) =>
                          setFormData({ ...formData, dimensions: e.target.value })
                        }
                        className="w-full bg-[#FAF8F5] dark:bg-[#231A14] border border-[#E8E4DC] dark:border-[#38261A] rounded-full px-4 py-2.5 text-xs font-medium text-[#201815] dark:text-white placeholder:text-[#9E948A] focus:outline-none focus:border-[#C59B63] transition-colors text-right"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-[#FAF8F5] dark:bg-[#231A14] border border-[#E8E4DC] dark:border-[#38261A] rounded-full px-4 py-2.5 pl-10 text-xs font-medium text-[#201815] dark:text-white placeholder:text-[#9E948A] focus:outline-none focus:border-[#8B5E3C] transition-colors text-right"
                    />
                    <Mail className="w-4 h-4 text-[#8B5E3C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Row 3: Consultation Type Select */}
                  <div className="relative">
                    <select
                      value={formData.consultationType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          consultationType: e.target.value,
                        })
                      }
                      className="w-full bg-[#FAF8F5] dark:bg-[#231A14] border border-[#E8E4DC] dark:border-[#38261A] rounded-full px-4 py-2.5 pl-10 pr-4 text-xs font-medium text-[#201815] dark:text-white focus:outline-none focus:border-[#8B5E3C] transition-colors appearance-none text-right cursor-pointer"
                    >
                      <option value="تصميم داخلي 3D">
                        نوع الاستشارة (اختر النوع...)
                      </option>
                      <option value="تصميم داخلي 3D">تصميم داخلي 3D</option>
                      <option value="تأثيث فيلا أو شقة كاملة">
                        تأثيث فيلا أو شقة كاملة
                      </option>
                      <option value="تجهيز مكتب أو مقر شركة">
                        تجهيز مكتب أو مقر شركة
                      </option>
                      <option value="استشارة ألوان وخامات">
                        استشارة ألوان وخامات
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#8B5E3C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Row 4: Notes Textarea */}
                  <div className="relative">
                    <textarea
                      rows={3}
                      placeholder="رسالتك (اختياري)"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full bg-[#FAF8F5] dark:bg-[#231A14] border border-[#E8E4DC] dark:border-[#38261A] rounded-2xl px-4 py-2.5 text-xs font-medium text-[#201815] dark:text-white placeholder:text-[#9E948A] focus:outline-none focus:border-[#8B5E3C] transition-colors resize-none text-right"
                    />
                  </div>

                  {/* Submit Button in Deep Espresso/Bronze Pill */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1F2421] hover:bg-[#C59B63] active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? "جاري الإرسال..." : "إرسال الطلب"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Showroom Facade Video Modal ── */}
      {showVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#1C1612] rounded-3xl overflow-hidden border border-[#523A2A] shadow-2xl p-6 text-white text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8D4B0]" />
                <h3 className="font-bold text-base">جولة في معرض Amazon Furniture الرئيسي بالمنصورة</h3>
              </div>
            </div>

            <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <Image
                src="/redesign/showroom-facade.jpg"
                alt="معرض المنصورة"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#E8D4B0] text-[#201815] flex items-center justify-center shadow-2xl mb-3">
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  معرض متكامل من طابقين يضم أكثر من 500 موديل
                </h4>
                <p className="text-xs text-white/80 max-w-md">
                  المنصورة: 52 شارع سامية الجمل، قسم ثان (أمازون للأثاث المكتبي والتجهيزات) • يومياً حتى 11 مساءً
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
