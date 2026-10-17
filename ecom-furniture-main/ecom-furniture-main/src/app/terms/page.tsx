import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle2, Truck, Wrench, Shield, CreditCard } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "الشروط والأحكام | Amazon Furniture",
  description: "الشروط والأحكام الرسمية لمتجر ومصنع Amazon Furniture للأثاث والديكور بالمنصورة وجمهورية مصر العربية.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 text-stone-800" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "الشروط والأحكام" }]} />

        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-amber-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <FileText size={16} />
              <span>اتفاقية الاستخدام والتعاقد</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              الشروط والأحكام العامة
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              تحدد هذه الشروط حقوقك والتزاماتك عند استخدام متجر Amazon Furniture أو الشراء منه أو طلب خدمات التفصيل والاستشارة المجانية.
            </p>
          </div>
        </div>

        {/* Term 1: Overview */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            1. نبذة عن المتجر وأطراف التعاقد
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            يتم تشغيل هذا المتجر الإلكتروني بواسطة إدارة <strong>Amazon Furniture</strong> (المعرض والمصنع: المنصورة، محافظة الدقهلية، جمهورية مصر العربية). بإتمامك أي طلب أو تسجيل حساب، فإنك تقر وتوافق على الالتزام بجميع البنود والشروط الموضحة هنا.
          </p>
        </div>

        {/* Term 2: Pricing and Orders */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <CreditCard className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              2. الأسعار، الدفع، وتأكيد الطلبات
            </h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            <p>
              - جميع الأسعار المعروضة على المتجر مقومة بالجنيه المصري (EGP).<br/>
              - يتم حساب وتدقيق الأسعار والخصومات الإجمالية بدقة على خوادمنا قبل تأكيد الطلب.<br/>
              - يوفر المتجر خيارات دفع متعددة: الدفع عند الاستلام (COD)، المحافظ الإلكترونية (فودافون كاش، أورنج، اتصالات، وي كاش)، شبكة المدفوعات اللحظية (إنستاباي - InstaPay)، وبطاقات الدفع الإلكتروني (فيزا / ماستركارد / ميزة).<br/>
              - في حالات الدفع بالتحويل الرقمي، يعتبر الطلب قيد المراجعة حتى فحص إيصال السداد المرفوع من قبل الإدارة المالية.
            </p>
          </div>
        </div>

        {/* Term 3: Shipping & Free Installation */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <Truck className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              3. الشحن، التوصيل، والتركيب الفني المعتمد
            </h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            <p>
              - يتم توصيل المنتجات لجميع محافظات جمهورية مصر العربية وفق مواعيد التسليم الموضحة في تأكيد الطلب.<br/>
              - خدمة التركيب الفني مجانية 100% بواسطة فنيي ونجاري مصنع Amazon Furniture المتخصصين لضمان سلامة التجميع.<br/>
              - يلتزم العميل بتوفير مسار مناسب ومساحة عمل خالية لنقل وتجميع قطع الأثاث داخل منزله أو مكتبه.
            </p>
          </div>
        </div>

        {/* Term 4: Custom Furniture */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <Wrench className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              4. تصنيع وتفصيل الأثاث المخصص (Custom Orders)
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            - المقاسات والخامات المحددة من قبل العميل في استمارة التفصيل يتم مراجعتها هندسياً واعتمادها بمقايسة سعر رسمية.<br/>
            - يبدأ جدول التصنيع الفعلي بالمصنع فور اعتماد العميل لعرض السعر وسداد العربون المتفق عليه.<br/>
            - مدة تصنيع القطع المخصصة تتراوح عادة بين 7 إلى 18 يوم عمل بحسب تعقيد التصميم وحجم المشروع.
          </p>
        </div>

        {/* Term 5: Intellectual Property */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <Shield className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              5. حقوق الملكية الفكرية
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            جميع الصور، التصاميم ثلاثية الأبعاد، الشعارات، والنصوص الواردة في هذا الموقع هي ملكية حصرية لـ Amazon Furniture ويحظر نسخها أو إعادة نشرها لأغراض تجارية دون إذن كتابي مسبق.
          </p>
        </div>

        <p className="text-xs text-stone-400 text-center">
          * تم تحديث هذه الشروط والأحكام في أكتوبر 2026. لأي استفسارات قانونية، يرجى التواصل عبر: legal@amazonfurniture.eg
        </p>
      </div>
    </div>
  );
}
