"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, Ruler } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useHydrated } from "@/hooks/useHydrated";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  // Hide bottom bar in admin dashboard
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      label: "الرئيسية",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/products",
      label: "المتجر",
      icon: ShoppingBag,
      isActive: pathname === "/products" || pathname?.startsWith("/products/"),
    },
    {
      href: "/#consultation",
      label: "استشارة مجانية",
      icon: Ruler,
      highlight: true,
      isActive: pathname === "/#consultation",
    },
    {
      href: "/wishlist",
      label: "المفضلة",
      icon: Heart,
      badge: hydrated && wishlistCount > 0 ? wishlistCount : null,
      isActive: pathname === "/wishlist",
    },
    {
      href: "/cart",
      label: "السلة",
      icon: ShoppingBag,
      badge: hydrated && cartCount > 0 ? cartCount : null,
      isActive: pathname === "/cart",
    },
  ];

  return (
    <nav
      aria-label="التنقل السريع على الهاتف"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                item.highlight
                  ? "text-amber-700 font-bold"
                  : item.isActive
                  ? "text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <div className="relative">
                {item.highlight ? (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md -mt-4 border-2 border-white">
                    <Icon size={18} />
                  </div>
                ) : (
                  <div className={`p-1 rounded-lg ${item.isActive ? "bg-slate-100" : ""}`}>
                    <Icon size={20} strokeWidth={item.isActive ? 2.4 : 1.8} />
                  </div>
                )}

                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 bg-black text-white text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  item.highlight ? "font-black text-amber-700" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
