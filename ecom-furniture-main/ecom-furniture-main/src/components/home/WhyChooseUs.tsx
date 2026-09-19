"use client";

import { useEffect, useRef } from "react";
import { Award, Leaf, Hammer, Truck } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { animate } from "animejs";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

export default function WhyChooseUs() {
  const iconsRef = useRef<HTMLDivElement[]>([]);
  const { language } = useLanguageStore();
  const t = getTranslation(language);

  const features = [
    {
      icon: Hammer,
      title: t.featHandmade,
      description: t.featHandmadeDesc,
    },
    {
      icon: Leaf,
      title: t.featSustainable,
      description: t.featSustainableDesc,
    },
    {
      icon: Award,
      title: t.featWarranty,
      description: t.featWarrantyDesc,
    },
    {
      icon: Truck,
      title: t.featDelivery,
      description: t.featDeliveryDesc,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            iconsRef.current.forEach((el, i) => {
              if (el) {
                animate(el, {
                  scale: [0, 1.15, 1],
                  rotate: [0, -10, 0],
                  duration: 800,
                  delay: i * 150,
                  ease: "outElastic(1, .6)",
                });
              }
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (iconsRef.current[0]) {
      observer.observe(iconsRef.current[0]);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-14">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-2">
            {t.whyTag}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary">
            {t.whyTitle}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 0.12}>
              <div className="group text-center">
                <div
                  ref={(el) => {
                    if (el) iconsRef.current[i] = el;
                  }}
                  className="w-16 h-16 mx-auto mb-5 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300"
                >
                  <feature.icon
                    size={28}
                    className="text-accent group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
