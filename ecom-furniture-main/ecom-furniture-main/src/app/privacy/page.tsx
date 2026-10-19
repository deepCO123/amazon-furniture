import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Eye, Database, ShieldCheck, UserCheck } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "سياسة الخصوصية وأمان البيانات | Amazon Furniture",
  description: "سياسة الخصوصية وحماية بيانات العملاء ومعايير التشفير المتبعة في متجر Amazon Furniture.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 text-stone-800" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "سياسة الخصوصية" }]} />

        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-amber-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Lock size={16} />
              <span>أمانك وخصوصيتك أولويتنا القصوى</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              سياسة الخصوصية وحماية البيانات
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              نوضح لك هنا بشفافية تامة كيف نجمع بياناتك الشخصية، ونستخدمها، ونحميها بأعلى بروتوكولات الأمان الإلكتروني والتشفير.
            </p>
          </div>
        </div>

        {/* Section 1: Data Collection */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <Database className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              1. البيانات التي نجمعها
            </h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            <p>
              نقوم بجمع البيانات الضرورية فقط لإتمام طلباتك وتقديم أفضل خدمة تصنيع وشحن:
            </p>
            <ul className="list-disc pr-6 space-y-1">
              <li><strong>البيانات الشخصية:</strong> الاسم، رقم الهاتف (واتساب)، والبريد الإلكتروني.</li>
              <li><strong>بيانات التوصيل والتركيب:</strong> عنوان الشارع، المدينة، المحافظة، وملاحظات الوصول.</li>
              <li><strong>بيانات التفصيل والمقاسات:</strong> أبعاد الغرفة أو المكتب، صور التصاميم المرفوعة، واختيارات الألوان.</li>
              <li><strong>بيانات الدفع:</strong> سكرينات إيصالات التحويل البنكي أو المحفظة الذكية؛ ولا نقوم بتخزين أو الاحتفاظ بأي أرقام سرية أو بطاقات بنكية ائتمانية على خوادمنا (حيث تتم معالجة البطاقات عبر بوابات مشفرة معتمدة).</li>
            </ul>
          </div>
        </div>

        {/* Section 2: How We Use Data */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <Eye className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              2. كيف نستخدم بياناتك؟
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            - معالجة طلبات الأثاث وتنسيق مواعيد الشحن والتركيب المجاني.<br/>
            - إرسال فواتير الشراء الرسمية وعقود الضمان لـ 10 سنوات عبر البريد الإلكتروني أو الواتساب.<br/>
            - إتاحة تتبع مسار الشحنات وحالة طلبات التفصيل عبر المتجر.<br/>
            - لن نقوم ببيع أو تأجير أو مشاركة بياناتك الشخصية مع أي طرف ثالث لأغراض تسويقية غير مصرح بها.
          </p>
        </div>

        {/* Section 3: Security & Encryption */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-emerald-700">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              3. أمان وتشفير البيانات (Security & Encryption)
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            - نستخدم بروتوكول التشفير الآمن <strong>HTTPS / TLS 1.3</strong> لجميع الاتصالات بين جهازك وخوادمنا.<br/>
            - يتم حفظ جلسات تسجيل الدخول عبر <strong>HttpOnly, Secure Cookies</strong> المحمية من هجمات XSS و CSRF.<br/>
            - كلمات المرور مشفرة بخوارزمية <strong>Bcrypt</strong> غير قابلة للعكس.<br/>
            - الملفات والصور المرفوعة تخضع للتحقق الأمني من الامتدادات لمنع أي برمجيات ضارة.
          </p>
        </div>

        {/* Section 4: Customer Rights */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <UserCheck className="w-6 h-6 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              4. حقوقك كعميل ومستخدم
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            يحق لك في أي وقت:
            <br/>
            - الاطلاع على بياناتك المسجلة أو تعديلها من خلال صفحة <Link href="/profile" className="text-amber-700 font-bold underline">الملف الشخصي</Link>.<br/>
            - طلب حذف حسابك وبياناتك المسجلة عبر التواصل مع الدعم الفني: privacy@amazonfurniture.eg.
          </p>
        </div>

        <p className="text-xs text-stone-400 text-center">
          * تم تحديث سياسة الخصوصية هذه في أكتوبر 2026 طبقاً لأحكام قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.
        </p>
      </div>
    </div>
  );
}
