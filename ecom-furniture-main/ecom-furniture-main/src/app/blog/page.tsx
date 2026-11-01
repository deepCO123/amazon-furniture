import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowLeft, ArrowRight, Clock, BookOpen, Search, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "مقالات ونصائح الديكور | Amazon Furniture",
  description:
    "كل ما تحتاج معرفته عن عالم الأثاث والديكور المنزلي والمكتبي، نصائح اختيار الأرائك، أنواع الخشب، وتنسيق المساحات من خبراء Amazon Furniture بالمنصورة.",
};

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  date: string;
  image: string;
}

const articles: Article[] = [
  {
    id: "1",
    slug: "5-tips-for-perfect-sofa",
    title: "5 نصائح لاختيار الأريكة المثالية لمنزلك",
    excerpt: "اكتشف أهم النصائح لاختيار الأريكة المناسبة لمساحتك وديكور منزلك لتضمن أقصى درجات الراحة والأناقة المستدامة.",
    content: [
      "تعتبر الأريكة محور غرفة المعيشة والقطعة الأكثر استخداماً يومياً، لذا يجب أن تجمع بين الجودة الهيكلية والراحة التامة والجمال العصري.",
      "1. قياس المساحة بدقة: احرص على ترك ممرات لا تقل عن 80 سم حول الأريكة لسهولة الحركة وتفادي التكدس.",
      "2. جودة الهيكل الداخلي: اختر دائماً خشب الزان الأحمر الطبيعي المجفف لأنه يقاوم التقوس والحشرات ويدوم لعشرات السنين.",
      "3. نوع الإسفنج: ابحث عن إسفنج سوفت ريبوند بكثافة لا تقل عن 33 كجم/م3 ليحافظ على تماسكه ولا يهبط مع الوقت.",
      "4. نوعية الأقمشة: اختر أقمشة معالجة بتقنية الوتربروف وسهلة التنظيف خصوصاً في وجود أطفال أو ضيوف.",
    ],
    category: "نصائح أثاث",
    readTime: "4 دقائق",
    date: "25 أكتوبر 2026",
    image: "/redesign/blog-sofa.jpg",
  },
  {
    id: "2",
    slug: "modern-minimal-home-guide",
    title: "كيف تجهز منزلك بأسلوب عصري وبسيط (Minimalist)؟",
    excerpt: "أفكار عملية ومبتكرة لتجديد منزلك بتكلفة مدروسة وخامات تعكس الفخامة العصرية الهادئة بعيداً عن الفوضى.",
    content: [
      "الأسلوب العصري البسيط لا يعني الفراغ أو البرودة، بل يعني التركيز على القطع العملية ذات الجودة العالية والخطوط الهادئة.",
      "1. لوحة ألوان دافئة ومحايدة: استند إلى درجات الأوف وايت، البيج الدافئ، ولمسات من الخشب الطبيعي بلون الكراميل والقهوة.",
      "2. الأثاث المنحني (Curved Shapes): الأرائك والطاولات المنحنية تمنح المكان انسيابية وألفة أكبر مقارنة بالزوايا الحادة.",
      "3. التخزين الذكي: اختر دواليب ووحدات تلفزيون مدمجة بدون مقابض بارزة للحفاظ على اتساع الرؤية البصرية.",
    ],
    category: "تصميم وديكور",
    readTime: "5 دقائق",
    date: "20 أكتوبر 2026",
    image: "/redesign/blog-armchair.jpg",
  },
  {
    id: "3",
    slug: "best-wood-types-guide",
    title: "أفضل أنواع الخشب للأثاث المنزلي: مقارنة شاملة",
    excerpt: "تعرف على الفرق بين خشب الزان الأحمر الطبيعي، الـ MDF المستورد، والأرو الروماني ومميزات كل نوع في التحمل.",
    content: [
      "جودة الأثاث تبدأ دائماً من الخشب الداخلي قبل التنجيد والدهانات الخارجية.",
      "1. خشب الزان الأحمر الطبيعي: يعتبر الخيار الأول للهياكل وقواعد الركنات والأنتريهات لكثافته العالية وصلابته ومقاومته للرطوبة.",
      "2. خشب الأرو الروماني: خشب فاخر ذو عروق طبيعية مميزة، مثالي لغرف النوم الفاخرة وسفر الطعام.",
      "3. الـ MDF المستورد: ممتاز في الأبواب والواجهات المطلية بدهانات دوكو فرن ملساء ومقاومة للمياه.",
    ],
    category: "خامات وصناعة",
    readTime: "6 دقائق",
    date: "15 أكتوبر 2026",
    image: "/redesign/blog-dining.jpg",
  },
  {
    id: "4",
    slug: "living-room-color-palette",
    title: "دليلك لاختيار الألوان المتناسقة في غرفة المعيشة",
    excerpt: "كيف تدمج بين الألوان الدافئة مثل الكراميل ودرجات القهوة مع الحياديات لتصنع فراغاً مريحاً ومبهجاً.",
    content: [
      "قاعدة 60-30-10 هي القاعدة الذهبية لتنسيق ألوان أي غرفة:",
      "- 60% للون الرئيسي (الجدران والأرضيات والسجاد المحايد).",
      "- 30% للون الثانوي (الأريكة الكبيرة أو الستائر).",
      "- 10% للألوان التوكيدية الجريئة (الوسائد، اللوحات، الديكورات).",
    ],
    category: "تصميم وديكور",
    readTime: "3 دقائق",
    date: "10 أكتوبر 2026",
    image: "/redesign/hero-living-room.jpg",
  },
  {
    id: "5",
    slug: "waterproof-fabrics-maintenance",
    title: "كيف تحافظ على الأقمشة الوتربروف لأطول فترة ممكنة؟",
    excerpt: "طرق تنظيف البقع الفورية وإرشادات العناية اليومية بأقمشة الصالونات والركنات لتدوم كالجديدة تماماً.",
    content: [
      "الأقمشة المعالجة بالنانو وتربروف تمنع امتصاص السوائل على الفور، لكنها تحتاج لتعامل سليم:",
      "1. تجفيف السوائل فوراً بمنديل جاف دون فرك البقعة.",
      "2. تجنب استخدام المنظفات الكيماوية القاسية أو المبيضات.",
      "3. استخدم قطعة قماش قطنية مبللة بقليل من الماء الفاتر والصابون الطبيعي عند الحاجة.",
    ],
    category: "عناية وصيانة",
    readTime: "4 دقائق",
    date: "5 أكتوبر 2026",
    image: "/redesign/consultation-armchair.jpg",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FBF6F0] dark:bg-[#120E0B] py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#7A6A5F] dark:text-[#A8988A] mb-6">
          <Link href="/" className="hover:text-[#5A3D2E] dark:hover:text-white transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-[#3B2A20] dark:text-[#E8D4B0] font-bold">مقالات ونصائح الديكور</span>
        </nav>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#FAF4ED] dark:bg-[#251A13] border border-[#E8DEC8] dark:border-[#38261A] text-[#8C532B] dark:text-[#E8D4B0] text-xs font-bold px-4 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مدونة أثاث وديكور Amazon Furniture</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#3B2A20] dark:text-[#FAF4ED] tracking-tight mb-3">
            مقالات وأفكار لتأثيث منزلك بأناقة
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5F] dark:text-[#A8988A] leading-relaxed">
            نشاركك أسرار اختيار الأثاث المتين، مقارنات الخامات، وأحدث صيحات الديكور العصري لتجعل منزلك مساحة راحة حقيقية.
          </p>
        </div>

        {/* Featured Top Article */}
        <div className="mb-12">
          <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#1C1612] border border-[#EDE5DA] dark:border-[#38261A] shadow-[0_8px_30px_rgba(90,61,46,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
            <div className="lg:col-span-7 p-6 sm:p-10 order-2 lg:order-1 text-right flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-end gap-3 mb-3">
                  <span className="text-[11px] font-bold text-[#8C532B] dark:text-[#E8D4B0] bg-[#FAF4ED] dark:bg-[#2B1E16] px-3 py-1 rounded-full">
                    {articles[0].category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#7A6A5F] dark:text-[#A8988A]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{articles[0].readTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#7A6A5F] dark:text-[#A8988A]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{articles[0].date}</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-3xl font-black text-[#3B2A20] dark:text-white mb-4 leading-tight">
                  {articles[0].title}
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6A5F] dark:text-[#D1C7BD] leading-relaxed mb-6 font-medium">
                  {articles[0].excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F5EFE7] dark:border-[#2D1F17] flex items-center justify-between">
                <Link
                  href={`/blog/${articles[0].slug}`}
                  className="inline-flex items-center gap-2 bg-[#5A3D2E] hover:bg-[#3D2619] active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-sm transition-all"
                >
                  <span>قراءة المقال كاملاً</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <span className="text-xs text-[#8C7D73] dark:text-[#A8988A] font-medium">بقلم فريق الديكور</span>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full min-h-[280px] order-1 lg:order-2 overflow-hidden">
              <Image
                src={articles[0].image}
                alt={articles[0].title}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* All Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.slice(1).map((art) => (
            <article
              key={art.id}
              className="group bg-white dark:bg-[#1C1612] rounded-3xl border border-[#EDE5DA] dark:border-[#38261A] overflow-hidden shadow-[0_4px_20px_rgba(43,30,22,0.04)] hover:shadow-[0_12px_32px_rgba(43,30,22,0.08)] hover:border-[#B88A56]/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative w-full h-52 overflow-hidden">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                  <Calendar className="w-3 h-3 text-[#E8D4B0]" />
                  <span>{art.date}</span>
                </div>
                <div className="absolute top-3 left-3 bg-[#5A3D2E]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {art.category}
                </div>
              </div>

              <div className="p-6 text-right flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#3B2A20] dark:text-[#FAF4ED] group-hover:text-[#8C532B] dark:group-hover:text-[#E8D4B0] transition-colors line-clamp-2 mb-2.5">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#7A6A5F] dark:text-[#A8988A] leading-relaxed line-clamp-3 font-medium">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F5EFE7] dark:border-[#2D1F17] flex items-center justify-between">
                  <Link
                    href={`/blog/${art.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C532B] dark:text-[#E8D4B0] hover:text-[#5A3D2E] dark:hover:text-white transition-colors"
                  >
                    <span>قراءة المزيد</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[11px] text-[#A8988A]">{art.readTime} قراءة</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA Box: Consultation */}
        <div className="mt-14 rounded-3xl bg-gradient-to-r from-[#5A3D2E] to-[#362114] text-white p-8 sm:p-10 text-center relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-black mb-2">
              تحتاج مساعدة في اختيار وتنسيق أثاث منزلك؟
            </h3>
            <p className="text-xs sm:text-sm text-white/85 mb-6 leading-relaxed">
              مهندسو الديكور في معرض Amazon Furniture بالمنصورة مستعدون لتقديم استشارة ثلاثية الأبعاد ومعاينة مجانية.
            </p>
            <Link
              href="/#consultation"
              className="inline-flex items-center gap-2 bg-[#E8D4B0] hover:bg-[#F3E2C3] active:scale-95 text-[#362114] font-bold text-xs sm:text-sm px-8 py-3 rounded-full shadow-md transition-all"
            >
              <span>احجز استشارتك المجانية الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

