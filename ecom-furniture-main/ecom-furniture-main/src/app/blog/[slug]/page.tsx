import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, ArrowRight, ArrowLeft, Clock, Share2, CheckCircle2, Phone } from "lucide-react";

interface ArticleDetail {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  date: string;
  image: string;
  author: string;
}

const articlesDatabase: Record<string, ArticleDetail> = {
  "5-tips-for-perfect-sofa": {
    slug: "5-tips-for-perfect-sofa",
    title: "5 نصائح لاختيار الأريكة المثالية لمنزلك",
    excerpt: "اكتشف أهم النصائح لاختيار الأريكة المناسبة لمساحتك وديكور منزلك لتضمن أقصى درجات الراحة والأناقة المستدامة.",
    content: [
      "تعتبر الأريكة أو الركنة حجر الأساس في أي غرفة معيشة، والقطعة التي يقضي عليها أفراد العائلة والضيوف أطول الساعات، لذا فاختيارها بعناية هو استثمار طويل الأمد.",
      "1. قياس المساحة بدقة: قبل الشراء، قس مساحة الغرفة بدقة، وتأكد من ترك ممر حركة لا يقل عن 80 إلى 90 سم بين الأريكة وطاولة القهوة، وبينها وبين المداخل لتفادي التكدس.",
      "2. جودة الهيكل الداخلي: لا تتنازل عن خشب الزان الأحمر الطبيعي المعالج ضد التسوس والرطوبة. هذا الخشب يتحمل الضغط والأوزان الثقيلة ولا يتأثر بتغير الفصول كالأخشاب المصنعة الرديئة.",
      "3. نوعية الإسفنج والكثافة: ابحث دائماً عن إسفنج سوفت ريبوند بكثافة 33 إلى 36 كجم/م3، حيث يمنحك راحة فائقة عند الجلوس ولا يتعرض للهبوط المزعج بمرور الأشهر الأولى.",
      "4. أقمشة معالجة وسهلة التنظيف: اختيار أقمشة مثل الكتان المقوى المعالج بالوتربروف أو الجلود الطبيعية يمنحك راحة بال هائلة عند انسكاب السوائل أو وجود أطفال.",
      "5. التناسق اللوني مع الديكور: ننصح باختيار ألوان محايدة للأريكة الرئيسية (كالأوف وايت، الرمادي الدافئ، أو البيج)، وإضافة الحيوية عبر الوسائد والإكسسوارات الجانبية.",
    ],
    category: "نصائح أثاث",
    readTime: "4 دقائق",
    date: "25 أكتوبر 2026",
    image: "/redesign/blog-sofa.jpg",
    author: "م. محمد سامي — خبير التصميم الداخلي في Amazon Furniture",
  },
  "modern-minimal-home-guide": {
    slug: "modern-minimal-home-guide",
    title: "كيف تجهز منزلك بأسلوب عصري وبسيط (Minimalist)؟",
    excerpt: "أفكار عملية ومبتكرة لتجديد منزلك بتكلفة مدروسة وخامات تعكس الفخامة العصرية الهادئة بعيداً عن الفوضى.",
    content: [
      "الأسلوب العصري البسيط هو أسلوب حياة يهدف إلى تحرير المساحات من التكدس والتركيز على القطع الفعالة ذات التصميم المريح والراقي.",
      "1. اعتماد الألوان الهادئة: استند إلى درجات الأوف وايت، والبيج الدافئ، مع لمسات من خشب الزان بدرجات البني العسلي والقهوة الداكنة.",
      "2. اختيار الأشكال المنحنية: الأثاث الدائري أو ذو الحواف المنحنية (Curved Furniture) يعطي انسيابية للمكان ويجعله يبدو أكثر اتساعاً وترحيباً.",
      "3. الإضاءة الطبيعية والديكور الوظيفي: كل قطعة في الغرفة يجب أن تؤدي غرضاً محدداً أو توفر جلسة مريحة دون ملء الزوايا بزخارف زائدة.",
    ],
    category: "تصميم وديكور",
    readTime: "5 دقائق",
    date: "20 أكتوبر 2026",
    image: "/redesign/blog-armchair.jpg",
    author: "فريق استشارات الديكور — معارض أمازون",
  },
  "best-wood-types-guide": {
    slug: "best-wood-types-guide",
    title: "أفضل أنواع الخشب للأثاث المنزلي: مقارنة شاملة",
    excerpt: "تعرف على الفرق بين خشب الزان الأحمر الطبيعي، الـ MDF المستورد، والأرو الروماني ومميزات كل نوع في التحمل.",
    content: [
      "الخشب هو العمود الفقري لأي قطعة أثاث، ومعرفة الفروق الأساسية تجنبك شراء منتجات تفقد متانتها سريعاً.",
      "1. خشب الزان الأحمر الروماني: الخشب الأفضل على الإطلاق في مصر للهياكل الداخلية للأرائك وقواعد غرف النوم والسفر، لصلابته ومقاومته للتقوس.",
      "2. خشب الأرو الطبيعي: خشب صلب وفخم جداً يتميز بتموجات عروقه الخشبية الجذابة ويستخدم في واجهات الغرف الفاخرة.",
      "3. ألواح MDF المستوردة: ممتازة في الأسطح المستوية والمكاتب العصرية عند طلائها بدهانات دوكو فرن مقاومة للرطوبة والحرارة.",
    ],
    category: "خامات وصناعة",
    readTime: "6 دقائق",
    date: "15 أكتوبر 2026",
    image: "/redesign/blog-dining.jpg",
    author: "إدارة المصنع والإنتاج — Amazon Furniture",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesDatabase[slug];
  if (!article) return { title: "مقال غير موجود | Amazon Furniture" };
  return {
    title: `${article.title} | Amazon Furniture`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articlesDatabase[slug] || articlesDatabase["5-tips-for-perfect-sofa"];

  if (!article) notFound();

  return (
    <article className="min-h-screen bg-[#FBF6F0] dark:bg-[#120E0B] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <nav className="flex items-center gap-2 text-xs text-[#7A6A5F] dark:text-[#A8988A] mb-6">
          <Link href="/" className="hover:text-[#5A3D2E] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#5A3D2E] transition-colors">
            المقالات
          </Link>
          <span>/</span>
          <span className="text-[#3B2A20] dark:text-[#E8D4B0] font-bold line-clamp-1">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="text-right mb-8">
          <div className="inline-block bg-[#FAF4ED] dark:bg-[#251A13] border border-[#E8DEC8] dark:border-[#38261A] text-[#8C532B] dark:text-[#E8D4B0] text-xs font-bold px-3 py-1 rounded-full mb-3">
            {article.category}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#3B2A20] dark:text-white leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-[#7A6A5F] dark:text-[#A8988A] pt-2 border-t border-[#EDE5DA] dark:border-[#38261A]">
            <span className="font-semibold text-[#5A3D2E] dark:text-[#E8D4B0]">{article.author}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.date}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden mb-10 shadow-md border border-[#EDE5DA] dark:border-[#38261A]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>

        {/* Article Body Content */}
        <div className="bg-white dark:bg-[#1C1612] rounded-3xl p-6 sm:p-10 border border-[#EDE5DA] dark:border-[#38261A] shadow-[0_4px_20px_rgba(43,30,22,0.04)] text-right space-y-5 text-sm sm:text-base text-[#423630] dark:text-[#D1C7BD] leading-relaxed">
          {article.content.map((paragraph, index) => (
            <p key={index} className="leading-loose">
              {paragraph}
            </p>
          ))}

          {/* Value Callout Box */}
          <div className="bg-[#FAF4ED] dark:bg-[#251A13] border-r-4 border-[#8C532B] dark:border-[#E8D4B0] p-4 sm:p-5 rounded-2xl my-6">
            <h4 className="font-bold text-[#3B2A20] dark:text-white mb-1 flex items-center justify-end gap-2 text-sm">
              <span>ضمان Amazon Furniture للجودة</span>
              <CheckCircle2 className="w-4 h-4 text-[#8C532B] dark:text-[#E8D4B0]" />
            </h4>
            <p className="text-xs text-[#7A6A5F] dark:text-[#A8988A] leading-relaxed">
              جميع منتجاتنا مصنعة بأيدي نجارين وفنيين مصريين محترفين من خشب الزان الأحمر الروماني مع ضمان رسمي موثق لمدة 10 سنوات، وخدمة استشارة هندسية ثلاثية الأبعاد مجانية.
            </p>
          </div>
        </div>

        {/* Footer Navigation & Call to action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5A3D2E] dark:text-[#E8D4B0] hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لجميع المقالات</span>
          </Link>

          <Link
            href="/#consultation"
            className="bg-[#5A3D2E] hover:bg-[#3D2619] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-sm transition-all flex items-center gap-2"
          >
            <span>احجز استشارة مع مهندس الديكور</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

