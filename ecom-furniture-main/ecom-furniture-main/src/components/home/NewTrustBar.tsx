"use client";

import { ShieldCheck, Trees, Compass, Truck } from "lucide-react";

export default function NewTrustBar() {
  const trustItems = [
    {
      id: "warranty",
      title: "ضمان 10 سنوات",
      subtitle: "معتمد ضد عيوب الصناعة",
      icon: ShieldCheck,
    },
    {
      id: "beech-wood",
      title: "تصنيع خشب زان أحمر طبيعي",
      subtitle: "متانة فائقة وأخشاب معالجة",
      icon: Trees,
    },
    {
      id: "3d-design",
      title: "معاينة وتصميم 3D مجاناً",
      subtitle: "رفع مقاسات وتخطيط هندسي",
      icon: Compass,
    },
    {
      id: "delivery-assembly",
      title: "شحن وتركيب احترافي",
      subtitle: "لكافة محافظات مصر",
      icon: Truck,
    },
  ];

  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-4 sm:py-6">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-[#F3EDE5] dark:bg-[#1C1612] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E8DEC8] dark:border-[#38261A] shadow-2xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 lg:divide-x lg:divide-x-reverse divide-[#DDD2C4] dark:divide-[#38261A]">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-center gap-3 sm:gap-4 p-2 sm:p-3 text-right"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/80 dark:bg-[#2B1E16] text-[#6D421F] dark:text-[#E8D4B0] flex items-center justify-center shrink-0 shadow-2xs border border-white/60 dark:border-white/5">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2B1E16] dark:text-[#F0EBE5] leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#7A6B60] dark:text-[#D4A373] font-medium mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
