"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface SeatingCard {
  title: string;
  subtitle: string;
  count: string;
  image: string;
  href: string;
}

const seatingCards: SeatingCard[] = [
  {
    title: "ركنة",
    subtitle: "ركنات مودرن واستقبال جلد وكتان خشب زان أحمر",
    count: "أكثر من 15 تصميم مميز",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    href: "/products?category=ركن ومجالس",
  },
  {
    title: "كنبة",
    subtitle: "كنب ثلاثي وثنائي راقي لمكاتب المديرين والمنازل",
    count: "تنجيد سوفت إسفنج كثافة 36",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800",
    href: "/products?category=ركن ومجالس",
  },
  {
    title: "ليزي بوي",
    subtitle: "كراسي استرخاء طبية بميكانيزم هزاز ودوار 360°",
    count: "راحة مطلقة للظهر والرقبة",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    href: "/products?category=ليزي بوي",
  },
];

export default function SeatingStyleSection() {
  return (
    <section className="py-14 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header: "جلسات على ذوقك :" (Oscar Style) ───────────────────── */}
        <div className="text-right mb-8">
          <div className="inline-block relative">
            <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight pb-1">
              جلسات على ذوقك :
            </h2>
            <div className="w-24 h-1 bg-amber-500 rounded-full" />
          </div>
        </div>

        {/* ── 3 Visual Luxury Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {seatingCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-[#f4ece3] border border-[#e5d8c8] flex flex-col"
            >
              {/* Image with warm minimalist aesthetic (matching Oscar screenshot) */}
              <div className="relative w-full pt-[80%] overflow-hidden bg-[#ecdccc]">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Card Label */}
              <div className="p-5 text-center bg-white/90 backdrop-blur-sm group-hover:bg-amber-500 transition-colors duration-300">
                <h3 className="text-xl sm:text-2xl font-black text-primary group-hover:text-black transition-colors mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">
                  {card.subtitle}
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 group-hover:text-black">
                  <span>تصفح الموديلات</span>
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
