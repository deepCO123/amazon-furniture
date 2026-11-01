"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
}

const posts: BlogPost[] = [
  {
    id: "post-1",
    title: "5 نصائح لاختيار الأريكة المثالية لمنزلك",
    excerpt: "اكتشف أهم النصائح لاختيار الأريكة المناسبة لمساحتك وديكور منزلك لتضمن الراحة والأناقة المستدامة.",
    date: "25 أكتوبر 2026",
    image: "/redesign/blog-sofa.jpg",
    slug: "5-tips-for-perfect-sofa",
  },
  {
    id: "post-2",
    title: "كيف تجهز منزلك بأسلوب عصري وبسيط؟",
    excerpt: "أفكار عملية ومبتكرة لتجديد منزلك بتكلفة مدروسة وخامات تعكس الفخامة العصرية الهادئة.",
    date: "20 أكتوبر 2026",
    image: "/redesign/blog-armchair.jpg",
    slug: "modern-minimal-home-guide",
  },
  {
    id: "post-3",
    title: "أفضل أنواع الخشب للأثاث المنزلي",
    excerpt: "تعرف على الفرق بين خشب الزان الأحمر الطبيعي، الـ MDF المستورد، والأرو الروماني ومميزات كل نوع.",
    date: "15 أكتوبر 2026",
    image: "/redesign/blog-dining.jpg",
    slug: "best-wood-types-guide",
  },
];

export default function NewBlogSection() {
  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header Row: Title & Subtitle in Center, "عرض الكل ←" on Left */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* "عرض الكل" button in Dark Coffee #422C1D */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-[#422C1D] hover:bg-[#2B1E16] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-colors order-2 sm:order-1"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>

          {/* Heading in Center */}
          <div className="text-center order-1 sm:order-2">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-8 sm:w-16" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2B1E16] dark:text-[#F7E7CE] tracking-tight">
                مقالات ونصائح
              </h2>
              <div className="h-px bg-[#D6CDC2] dark:bg-[#3D2C20] w-8 sm:w-16" />
            </div>
            <p className="text-xs sm:text-sm text-[#8C7D73] dark:text-[#D4A373] mt-1 font-medium">
              كل ما تحتاج معرفته عن عالم الأثاث والديكور
            </p>
          </div>

          <div className="w-24 hidden sm:block order-3" />
        </div>

        {/* 3 Articles Grid matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white dark:bg-[#1C1612] rounded-2xl sm:rounded-3xl border border-[#EDE5DA] dark:border-[#38261A] overflow-hidden shadow-[0_2px_12px_rgba(43,30,22,0.03)] hover:shadow-[0_8px_24px_rgba(43,30,22,0.08)] hover:border-[#D4A373]/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Cover Image Container */}
              <div className="relative w-full h-48 sm:h-52 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                  <Calendar className="w-3 h-3 text-[#E8D4B0]" />
                  <span>{post.date}</span>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-5 text-right flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-sm sm:text-base font-bold text-[#2B1E16] dark:text-[#F0EBE5] group-hover:text-[#9E6D38] dark:group-hover:text-[#D4A373] transition-colors line-clamp-1 mb-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#7A6B60] dark:text-[#A8988A] leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read More Link */}
                <div className="pt-4 mt-3 border-t border-[#F5EFE7] dark:border-[#2D1F17] flex items-center justify-end">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E6D38] dark:text-[#D4A373] group-hover:translate-x-1 transition-transform"
                  >
                    <span>قراءة المزيد</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
