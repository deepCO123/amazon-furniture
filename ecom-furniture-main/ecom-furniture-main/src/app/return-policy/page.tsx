import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, RotateCcw, CheckCircle2, AlertCircle, Phone, MessageCircle } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع والاستبدال والضمان | Amazon Furniture",
  description: "سياسة الاسترجاع والاستبدال القانونية طبقاً لقانون حماية المستهلك المصري، وتفاصيل ضمان خشب الزان الطبيعي لمدة 10 سنوات من مصنع Amazon Furniture.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 text-stone-800" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "سياسة الاسترجاع والضمان" }]} />

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <ShieldCheck size={16} />
              <span>حقوقك مضمونة رسمياً</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              سياسة الاسترجاع، الاستبدال، وعقد الضمان
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              في Amazon Furniture نلتزم بأعلى معايير الشفافية وحماية المستهلك المصري، ونضمن لك تجربة تسوق آمنة وخالية من أي مخاطر.
            </p>
          </div>
        </div>

        {/* Policy Section 1: Statutory Rights */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex items-center gap-3 text-amber-700">
            <RotateCcw className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              1. حق الاسترجاع والاستبدال (طبقاً لقانون حماية المستهلك رقم 181 لسنة 2018)
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-stone-600 leading-relaxed">
            <p>
              يحق للعميل استرجاع أو استبدال المنتجات الجاهزة خلال <strong>14 يوماً</strong> من تاريخ الاستلام دون إبداء أسباب، أو خلال <strong>30 يوماً</strong> إذا وجد بالمنتج عيب صناعة أو كان غير مطابق للمواصفات المتفق عليها.
            </p>

            <h3 className="font-bold text-stone-900 text-base">شروط قبول المرتجع:</h3>
            <ul className="space-y-2 list-none pr-0">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>أن يكون المنتج بحالته الأصلية دون كسر أو خدوش ناتجة عن سوء الاستخدام.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>إرفاق الفاتورة الرسمية أو رقم الطلب المسجل.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>تقديم طلب الاسترجاع عبر صفحة التتبع (<Link href="/track" className="text-amber-700 font-bold underline">تتبع طلبك والمرتجعات</Link>) أو عبر خدمة العملاء.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Policy Section 2: Custom Orders */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-orange-600">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              2. سياسة المنتجات المصنعة بمقاسات ومواصفات خاصة (التفصيل)
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            المنتجات التي يتم تصنيعها أو تفصيلها خصيصاً بناءً على طلب العميل بمقاسات أو خامات أو ألوان محددة ومخصصة (المكاتب الخاصة، الركنيات العمولة، والمطابخ) لا تخضع للاسترجاع النقدي المجرد إلا في حالة وجود عيب مصنعي أو عدم مطابقة للمقاسات والتصميم المتفق عليه في المقايسة المعتمدة. وفي هذه الحالة، يتحمل المصنع تعديل القطعة بالكامل مجاناً أو استبدالها.
          </p>
        </div>

        {/* Policy Section 3: 10-Year Warranty */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-600">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              3. عقد الضمان المعتمد لمدة 10 سنوات
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            نقدم ضماناً رسمياً معتمداً لمدة <strong>10 سنوات كاملة</strong> يشمل:
          </p>
          <ul className="space-y-2 text-stone-600 text-sm sm:text-base">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>هياكل خشب الزان الأحمر الطبيعي المعالج ضد التسوس والتقوس والانكسار.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>لحامات الشاسيهات المعدنية وقواعد الكراسي الهيدروليكية المعتمدة.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>صيانة دورية مجانية للمفصلات والميكانيزم داخل محافظات الدلتا والقاهرة الكبرى.</span>
            </li>
          </ul>
        </div>

        {/* Policy Section 4: Refund Process */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            4. آلية استرداد الأموال (Refunds)
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            - في حالة الدفع ببطاقات الائتمان، يتم رد المبلغ إلى نفس البطاقة البنكية خلال 5 إلى 14 يوم عمل طبقاً لسياسة البنك المصدر.<br/>
            - في حالة التحويل عبر إنستاباي أو فودافون كاش، يتم التحويل فور فحص واستلام المرتجع لمستودعاتنا.<br/>
            - في حالة الدفع عند الاستلام، يتم استرداد المبلغ عبر تحويل بنكي أو محفظة إلكترونية للعميل.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-black text-stone-900 text-base">هل تحتاج مساعدة بخصوص طلبك أو ضمانك؟</h4>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">فريق خدمة العملاء متواجد لمساعدتك يومياً من 10 صباحاً إلى 10 مساءً.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/201091084863"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-md"
            >
              <MessageCircle size={16} />
              <span>واتساب الدعم الفني</span>
            </a>
            <a
              href="tel:+201091084863"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-md"
            >
              <Phone size={16} />
              <span>اتصل بنا</span>
            </a>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center">
          * تخضع هذه السياسات للقوانين السارية بجمهورية مصر العربية، ومراجعة دورية من قبل الاستشاري القانوني للمتجر.
        </p>
      </div>
    </div>
  );
}
