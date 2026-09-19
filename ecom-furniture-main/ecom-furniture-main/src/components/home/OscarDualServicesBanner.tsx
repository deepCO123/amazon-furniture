"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Ruler, MessageCircle, X, CheckCircle } from "lucide-react";

export default function OscarDualServicesBanner() {
  const [showB2BModal, setShowB2BModal] = useState(false);
  const [b2bData, setB2bData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    projectType: "فرش مقر إداري متكامل",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleB2BSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `مرحباً أستاذ محمد إسماعيل، استفسار بخصوص خدمة B2B لفرش الشركات:
*اسم الشركة / المنشأة:* ${b2bData.companyName}
*المسؤول:* ${b2bData.contactPerson}
*رقم الهاتف:* ${b2bData.phone}
*نوع المشروع:* ${b2bData.projectType}
*ملاحظات أو متطلبات:* ${b2bData.notes || "طلب مقايسة وزيارة موقع ومعاينة ثلاثية الأبعاد"}

نود التنسيق لموعد الزيارة والحصول على أفضل عرض سعر مخصص للشركات من المصنع مباشرة.`;

    const url = `https://wa.me/201091084863?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setIsSubmitted(true);
  };

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── 2-Column Responsive Banner Grid (Oscar Screenshot 5) ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Banner 1: تصميم 3D مجاني (Free 3D Design) ───────────────── */}
          <div className="relative rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[380px] shadow-lg group">
            {/* Background Image: Designer working on 3D software */}
            <Image
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200"
              alt="تصميم 3D مجاني - تخيل شقتك قبل الفرش"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Soft Ambient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

            {/* Frosted Glass Overlay Card */}
            <div className="absolute inset-y-6 right-6 sm:right-10 flex items-center z-10">
              <div className="bg-[#e4ded5]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center max-w-[290px] sm:max-w-[340px] shadow-2xl border border-white/40">
                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                  تصميم 3D
                </h3>
                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-2">
                  مجــــانـي
                </h3>

                <p className="text-sm sm:text-base font-bold text-gray-800 mb-6 leading-relaxed">
                  تخيل شقتك قبل الفرش
                </p>

                <Link
                  href="/#consultation"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-black text-sm px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <Ruler size={16} className="text-amber-600" />
                  <span>قبل التنفيذ</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Banner 2: خدمة B2B لفرش الشركات (Corporate Furnishing) ───── */}
          <div className="relative rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[380px] shadow-lg group">
            {/* Background Image: Executive luxury modern office suite */}
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200"
              alt="خدمة B2B لفرش الشركات"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Elegant Organic Beige Curve Panel on the Right */}
            <div className="absolute inset-0 z-10 flex items-center justify-end">
              <div className="relative h-full w-full sm:w-[60%] flex flex-col justify-center items-center text-center p-6 sm:p-8 bg-[#f5ede4]/95 backdrop-blur-sm [clip-path:ellipse(120%_100%_at_100%_50%)] sm:[clip-path:ellipse(110%_100%_at_100%_50%)] shadow-2xl">
                <div className="space-y-3 max-w-[280px]">
                  <h3 className="text-3xl sm:text-4xl font-black text-[#f97316] tracking-tight">
                    خدمة B2B
                  </h3>

                  <div className="flex items-center justify-center gap-2 text-gray-800 font-extrabold text-lg sm:text-xl">
                    <span className="h-px w-6 bg-gray-400" />
                    <span>لفرش الشركات</span>
                    <span className="h-px w-6 bg-gray-400" />
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 font-semibold leading-relaxed pt-1 pb-2">
                    تجهيز مقرات، مكاتب إدارية، وقاعات اجتماعات بأعلى خامات الخشب والجلد والهيدروليك بأسعار المصنع.
                  </p>

                  <div>
                    <button
                      onClick={() => setShowB2BModal(true)}
                      className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Building2 size={16} />
                      <span>مساحة عمل تليق بنجاحك</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── B2B Corporate Request Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showB2BModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-orange-200 text-right"
            >
              <button
                onClick={() => {
                  setShowB2BModal(false);
                  setIsSubmitted(false);
                }}
                className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    خدمة B2B لفرش مقرات الشركات
                  </h3>
                  <p className="text-xs text-gray-500">
                    مقايسة مجانية، معاينة موقع، وتصاميم 3D مخصصة من المصنع
                  </p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    تم إرسال طلب المقايسة بنجاح!
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    تم فتح محادثة الواتساب مع الباشمهندس محمد إسماعيل لمراجعة تفاصيل المقر وتحديد ميعاد المعاينة المجانية.
                  </p>
                  <button
                    onClick={() => {
                      setShowB2BModal(false);
                      setIsSubmitted(false);
                    }}
                    className="bg-gray-900 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-gray-800 cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                <form onSubmit={handleB2BSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      اسم الشركة أو المنشأة *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: شركة أفق للتطوير العقاري"
                      value={b2bData.companyName}
                      onChange={(e) =>
                        setB2bData({ ...b2bData, companyName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        اسم المسؤول *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="الاسم الكريم"
                        value={b2bData.contactPerson}
                        onChange={(e) =>
                          setB2bData({ ...b2bData, contactPerson: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        رقم الهاتف / الواتساب *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010XXXXXXXX"
                        value={b2bData.phone}
                        onChange={(e) =>
                          setB2bData({ ...b2bData, phone: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      نوع المشروع والمطلوب تجهيزه
                    </label>
                    <select
                      value={b2bData.projectType}
                      onChange={(e) =>
                        setB2bData({ ...b2bData, projectType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 outline-none bg-white"
                    >
                      <option value="فرش مقر إداري متكامل">فرش مقر إداري متكامل</option>
                      <option value="مكاتب وكراسي موظفين">مكاتب وكراسي موظفين</option>
                      <option value="مكتب مدير تنفيذي فاخر وقاعة اجتماعات">
                        مكتب مدير تنفيذي فاخر وقاعة اجتماعات
                      </option>
                      <option value="ركنات استقبال وعيادات ومراكز طبية">
                        ركنات استقبال وعيادات ومراكز طبية
                      </option>
                      <option value="ستائر مكتبية بلاك أوت وزيبرا لمبنى كامل">
                        ستائر مكتبية بلاك أوت وزيبرا لمبنى كامل
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ملاحظات أو المساحة التقريبية (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="المساحة، الموقع، الميعاد المتوقع..."
                      value={b2bData.notes}
                      onChange={(e) =>
                        setB2bData({ ...b2bData, notes: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-orange-500 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle size={18} />
                      <span>إرسال طلب المقايسة عبر الواتساب الفوري</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
