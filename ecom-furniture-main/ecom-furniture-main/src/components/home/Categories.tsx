"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

const categoryNameMap: Record<string, { ar: string; sa: string; en: string }> = {
  Sofas: { ar: "صالونات وركن", sa: "كنب ومجالس", en: "Sofas" },
  Tables: { ar: "طاولات وسفرة", sa: "طاولات ومجالس", en: "Tables" },
  Chairs: { ar: "كراسي وبف", sa: "كراسي وجلسات", en: "Chairs" },
  Beds: { ar: "غرف نوم وأسرة", sa: "غرف نوم وأسرة", en: "Beds" },
  Storage: { ar: "دواليب وتخزين", sa: "دواليب وتخزين", en: "Storage" },
};

export default function Categories() {
  const { language } = useLanguageStore();
  const t = getTranslation(language);
  const isEn = language === "en";

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-2">
            {t.categoriesTitle}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary">
            {t.categoriesSubtitle}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category, i) => {
            const mappedName =
              categoryNameMap[category.name]?.[language] || category.name;
            const countLabel = isEn
              ? `${category.productCount} products`
              : `${category.productCount} منتجات`;

            return (
              <AnimatedSection key={category.id} delay={i * 0.1}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden block shadow-xs"
                >
                  <Image
                    src={category.image}
                    alt={mappedName}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4 text-start">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {mappedName}
                    </h3>
                    <p className="text-white/70 text-xs mt-0.5">{countLabel}</p>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
