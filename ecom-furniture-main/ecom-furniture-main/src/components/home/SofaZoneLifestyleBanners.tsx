"use client";

import Link from "next/link";
import Image from "next/image";

interface CoffeeCornerCard {
  id: string;
  title: string;
  price: string;
  oldPrice: string;
  photo: string;
  thumb: string;
  href: string;
}

const coffeeCards: CoffeeCornerCard[] = [
  {
    id: "cc-1",
    title: "كوفي كورنر...",
    price: "10,118.00 جنية",
    oldPrice: "LE 12,670.00",
    photo: "/coffee-corners/photo-1.png",
    thumb: "/coffee-corners/thumb-1.png",
    href: "/products?category=كوفي كورنر",
  },
  {
    id: "cc-2",
    title: "كوفي كورنر...",
    price: "18,053.00 جنية",
    oldPrice: "LE 22,620.00",
    photo: "/coffee-corners/photo-2.png",
    thumb: "/coffee-corners/thumb-2.png",
    href: "/products?category=كوفي كورنر",
  },
  {
    id: "cc-3",
    title: "كوفي كورنر...",
    price: "8,623.00 جنية",
    oldPrice: "LE 10,798.00",
    photo: "/coffee-corners/photo-3.png",
    thumb: "/coffee-corners/thumb-3.png",
    href: "/products?category=كوفي كورنر",
  },
  {
    id: "cc-4",
    title: "كوفي كورنر...",
    price: "9,658.00 جنية",
    oldPrice: "LE 12,094.00",
    photo: "/coffee-corners/photo-4.png",
    thumb: "/coffee-corners/thumb-4.png",
    href: "/products?category=كوفي كورنر",
  },
];

export default function SofaZoneLifestyleBanners() {
  return (
    <section className="py-12 bg-[#F8F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Top Header Banner with Website Theme Colors ─────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md border border-[#E8E0D5] bg-[#6B4F3A] text-white py-8 sm:py-10 px-4 text-center">
          {/* Subtle background ambient image */}
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <Image
              src="/coffee-corners/banner-warm-brown.png"
              alt="كوفي كورنرز"
              fill
              className="object-cover"
            />
          </div>
          {/* Warm mocha gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#573E2D]/90 via-[#6B4F3A]/85 to-[#573E2D]/90 pointer-events-none" />

          {/* Banner Content */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Torn-paper / brush title box */}
            <div className="inline-block relative mb-3">
              <div className="bg-[#E8D8C3] text-[#6B4F3A] font-black text-xl sm:text-2xl lg:text-3xl px-8 sm:px-12 py-2 rounded-lg shadow-md transform -rotate-0.5 border border-white/50">
                كوفي كورنرز
              </div>
            </div>

            {/* Subtitle */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
              خد بريك واستمتع
            </h2>
          </div>
        </div>

        {/* ── 4 Coffee Corner Product Cards (Image 3 Style) ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {coffeeCards.map((card) => (
            <div
              key={card.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Product Photo Container */}
              <Link
                href={card.href}
                className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2] flex items-center justify-center"
              >
                <Image
                  src={card.photo}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-106 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>

              {/* Bottom Information Overlay Bar (Image 3 Style) */}
              <div className="bg-[#74685E]/90 text-white p-3 sm:p-3.5 backdrop-blur-sm mt-auto border-t border-white/10 flex items-center justify-between gap-2.5">
                {/* Right Details: Thumbnail + Title + Price */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* Miniature Thumbnail */}
                  <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0 border border-white/20 bg-white/10">
                    <Image
                      src={card.thumb}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Texts */}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate leading-tight">
                      {card.title}
                    </div>
                    <div className="text-xs font-black text-[#B93832] leading-tight mt-0.5">
                      {card.price}
                    </div>
                    <div className="text-[10px] text-gray-300 line-through leading-tight">
                      {card.oldPrice}
                    </div>
                  </div>
                </div>

                {/* Left: Golden Action Button */}
                <Link
                  href={card.href}
                  className="shrink-0 bg-[#C58B45] hover:bg-[#b07837] active:scale-95 text-white font-black text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md whitespace-nowrap"
                >
                  تسوق الان
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
