"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  Truck,
  ShieldCheck,
  CreditCard,
  Ruler,
  Phone,
  MessageCircle,
  Sparkles,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "shipping-1",
    category: "الشحن والتوصيل",
    question: "هل تقومون بالشحن والتوصيل لكافة محافظات مصر؟",
    answer: "نعم، نوفر خدمة شحن سريعة ومؤمنة بالكامل مع أسطول سيارات مجهز لكافة محافظات وجه بحري والوجه القبلي والقاهرة الكبرى والإسكندرية، مع فريق فني متخصص لتنزيل وتركيب الأثاث في منزلك.",
  },
  {
    id: "shipping-2",
    category: "الشحن والتوصيل",
    question: "كم تستغرق مدة التوصيل بعد تأكيد الطلب؟",
    answer: "المنتجات الجاهزة للاستلام الفوري (In Stock) يتم توصيلها وتركيبها خلال 48 إلى 72 ساعة داخل المنصورة ومحافظات الدلتا، ومن 3 إلى 5 أيام لباقي المحافظات. أما الطلبات الخاصة والتفصيل فتستغرق من 10 إلى 15 يوماً عمل.",
  },
  {
    id: "quality-1",
    category: "الخامات والضمان",
    question: "ما هي تفاصيل الضمان المعتمد 10 سنوات؟",
    answer: "نمنحك شهادة ضمان رسمي موثقة لمدة 10 سنوات ضد أي عيوب صناعة أو تقوس في الهياكل الخشبية المصنوعة من خشب الزان الأحمر الروماني الطبيعي، بالإضافة لضمان 5 سنوات على متانة الإسفنج عالي الكثافة (سوفت ريبوند).",
  },
  {
    id: "quality-2",
    category: "الخامات والضمان",
    question: "ما هي نوعية الأخشاب والإسفنج المستخدمة في التصنيع؟",
    answer: "نعتمد بنسبة 100% على خشب الزان الأحمر الطبيعي المجفف صناعياً للهياكل الداخلية، وإسفنج سوفت ريبوند بكثافة 33 إلى 36 كجم/م3، وأقمشة وتربروف معالجة ضد امتصاص السوائل والاتساخ من كبرى مصانع الأقمشة.",
  },
  {
    id: "custom-1",
    category: "التفصيل والاستشارات",
    question: "هل يمكنني تفصيل ركنة أو صالون أو دولاب بمقاسات وألوان مخصصة؟",
    answer: "بالتأكيد! نوفر قسماً متكاملاً للتصنيع المخصص حسب المقاسات؛ يمكنك اختيار التصميم وتحديد أبعاد غرفتك واختيار كود ولون القماش المناسب لك، وسيقوم مهندس الديكور برسم تصميم 3D مجاني قبل بدء التصنيع.",
  },
  {
    id: "custom-2",
    category: "التفصيل والاستشارات",
    question: "كيف أحجز موعداً للمعاينة ورفع المقاسات بالمنصورة؟",
    answer: "يمكنك ملء نموذج 'احجز استشارتك المجانية' على الموقع، أو التواصل المباشر عبر الواتساب على 01012345678، وسيقوم مهندس من فريقنا بزيارة موقعك بالمنصورة لرفع المقاسات ومناقشة تفاصيل الديكور مجاناً وبدون أي التزام.",
  },
  {
    id: "payment-1",
    category: "طرق الدفع والتقسيط",
    question: "ما هي طرق الدفع المتاحة داخل المتجر والمعرض؟",
    answer: "نوفر خيارات دفع متعددة ومرنة: الدفع النقدي عند الاستلام بعد الفحص والتركيب، بطاقات Visa وMasterCard، محافظ الهاتف الإلكترونية (فودافون كاش، إنستاباي)، وشبكة فوري (Fawry).",
  },
  {
    id: "payment-2",
    category: "طرق الدفع والتقسيط",
    question: "هل تتوفر خطط تقسيط؟",
    answer: "نعم، نوفر خيارات تقسيط ميسرة عبر كروت الائتمان البنكية وبنك مصر والبنك الأهلي، وخدمات فاليو وأمان وسهولة وغيرها من برامج التقسيط المعتمدة.",
  },
  {
    id: "returns-1",
    category: "الاستبدال والاسترجاع",
    question: "ما هي سياسة الاستبدال والاسترجاع؟",
    answer: "يحق للعميل استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام وفقاً لأحكام حماية المستهلك، بشرط سلامة المنتج وعدم استخدامه بحالته الأصلية، ويتم فحص المنتج ورد المبلغ بنفس وسيلة الدفع خلال 3 إلى 5 أيام عمل.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [openId, setOpenId] = useState<string | null>("shipping-1");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["الكل", "الشحن والتوصيل", "الخامات والضمان", "التفصيل والاستشارات", "طرق الدفع والتقسيط", "الاستبدال والاسترجاع"];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = activeCategory === "الكل" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FBF6F0] dark:bg-[#120E0B] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#7A6A5F] dark:text-[#A8988A] mb-6">
          <Link href="/" className="hover:text-[#5A3D2E] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-[#3B2A20] dark:text-[#E8D4B0] font-bold">الأسئلة الشائعة</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FAF4ED] dark:bg-[#251A13] border border-[#E8DEC8] dark:border-[#38261A] text-[#8C532B] dark:text-[#E8D4B0] text-xs font-bold px-4 py-1.5 rounded-full mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>مركز المساعدة والإجابات السريعة</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#3B2A20] dark:text-white tracking-tight mb-3">
            الأسئلة الأكثر شيوعاً
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5F] dark:text-[#A8988A]">
            إجابات واضحة ومباشرة حول الشحن، خامات التصنيع، الضمان، وطرق الدفع والتفصيل.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#5A3D2E] text-white shadow-sm"
                  : "bg-white dark:bg-[#1C1612] text-[#7A6A5F] dark:text-[#D1C7BD] border border-[#EDE5DA] dark:border-[#38261A] hover:border-[#5A3D2E]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-[#1C1612] rounded-2xl border border-[#EDE5DA] dark:border-[#38261A] overflow-hidden shadow-[0_2px_10px_rgba(43,30,22,0.02)] transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#5A3D2E] text-white" : "bg-[#FAF4ED] dark:bg-[#2B1E16] text-[#7A6A5F]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#3B2A20] dark:text-[#FAF4ED] flex-1">
                    {faq.question}
                  </h3>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-right border-t border-[#F5EFE7] dark:border-[#2D1F17]">
                    <p className="text-xs sm:text-[13px] text-[#5A4B42] dark:text-[#D1C7BD] leading-relaxed font-medium">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support Footer Box */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C1612] border border-[#EDE5DA] dark:border-[#38261A] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
          <div>
            <h4 className="text-base sm:text-lg font-black text-[#3B2A20] dark:text-white mb-1">
              لديك استفسار آخر لم تجد إجابته هنا؟
            </h4>
            <p className="text-xs text-[#7A6A5F] dark:text-[#A8988A]">
              فريق خدمة العملاء واستشارات الأثاث متاح يومياً من 10 ص حتى 10 م.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/201091084863"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب</span>
            </a>
            <a
              href="tel:01012345678"
              className="inline-flex items-center gap-2 bg-[#5A3D2E] hover:bg-[#3D2619] active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>اتصل بنا</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

