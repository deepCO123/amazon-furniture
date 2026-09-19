"use client";

import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLanguageStore } from "@/store/languageStore";

export default function Testimonials() {
  const { language } = useLanguageStore();
  const isEn = language === "en";

  // Pick diverse reviews: Egyptian, Saudi, and English
  const displayReviews = [
    reviews.find((r) => r.locale === "ar") || reviews[0],
    reviews.find((r) => r.locale === "sa") || reviews[3],
    reviews.find((r) => r.locale === "en") || reviews[6],
    reviews[1] || reviews[0],
  ].filter(Boolean);

  return (
    <section className="py-20 bg-white border-t border-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#C5A880]/15 text-[#8B6E45] mb-3">
            {isEn ? "Customer Stories & Feedback" : "آراء وتجارب عملائنا في مصر والخليج"}
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-primary">
            {isEn ? "What Our Clients Say" : "تجارب نعتز بها من عملاء Amazon Furniture"}
          </h2>
          <p className="text-sm text-muted mt-2 max-w-xl mx-auto">
            {isEn
              ? "Real feedback from our valued clients across Cairo, Riyadh, and worldwide."
              : "آراء حقيقية من عملائنا في القاهرة، الرياض، جدة ومختلف المحافظات."}
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayReviews.map((review, i) => (
            <AnimatedSection key={`${review.id}-${i}`} delay={i * 0.1}>
              <div className="bg-surface/50 hover:bg-surface border border-surface-dark rounded-2xl p-6 h-full flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Quote size={22} className="text-[#C5A880]/60" />
                    {review.locale === "sa" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🇸🇦 السعودية
                      </span>
                    )}
                    {review.locale === "ar" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        🇪🇬 مصر
                      </span>
                    )}
                    {review.locale === "en" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        🇬🇧 International
                      </span>
                    )}
                  </div>

                  <p className="text-primary/80 text-xs sm:text-sm leading-relaxed mb-4">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={13}
                        className={
                          j < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-surface-dark"
                        }
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-surface-dark/50">
                    <div className="w-10 h-10 bg-[#C5A880]/20 text-[#8B6E45] font-bold rounded-full flex items-center justify-center text-xs shrink-0">
                      {review.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary text-xs truncate">
                        {review.author}
                      </p>
                      <p className="text-muted text-[11px] truncate">
                        {review.location || "عميل موثق ✓"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
