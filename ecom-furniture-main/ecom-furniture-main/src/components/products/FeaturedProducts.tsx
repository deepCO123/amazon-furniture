"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { formatPrice } from "@/lib/utils";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

export default function FeaturedProducts() {
  const getFeatured = useProductStore((s) => s.getFeaturedProducts);
  const featured = getFeatured();
  const { language } = useLanguageStore();
  const t = getTranslation(language);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-2">
            {t.featuredTitle}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary">
            {t.featuredSubtitle}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 0.1}>
              <Link href={`/products/${product.slug}`} className="group block text-start">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface mb-4 border border-surface-dark shadow-xs">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3 className="font-bold text-primary group-hover:text-accent-dark transition-colors mb-1 text-base">
                  {product.name}
                </h3>
                <p className="text-accent-dark font-extrabold text-base">
                  {formatPrice(product.price)}
                </p>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent-dark transition-colors group text-base"
          >
            <span>{t.allProducts}</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1"
            />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
