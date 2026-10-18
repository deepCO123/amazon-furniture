"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
  Ruler,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useProductStore } from "@/store/productStore";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { formatPrice, cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { useLanguageStore } from "@/store/languageStore";
import { getTranslation } from "@/lib/translations";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const products = useProductStore((s) => s.products);
  const { language } = useLanguageStore();
  const t = getTranslation(language);
  const isEn = language === "en";

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistItems = useWishlistStore((s) => s.items);
  const user = useAuthStore((s) => s.user);

  // Search categories matching store
  const searchCategories = [
    { value: "all", label: t.searchAllCategories },
    { value: "غرف النوم", label: t.bedroomsLink },
    { value: "المطابخ", label: t.kitchensLink },
    { value: "كراسي مكتب", label: t.chairsAndDesksLink },
    { value: "ركن ومجالس", label: t.livingAndLoungesLink },
    { value: "أثاث خارجي", label: t.outdoorLink },
    { value: "دريسنج روم", label: t.dressingRoomLink },
    { value: "اضاءة", label: t.decorLink },
  ];

  interface NavLinkItem {
    href: string;
    label: string;
    hasBadge?: boolean;
    badge?: string;
    highlight?: boolean;
  }

  // Secondary dark bar navigation links (Centered Features Bar)
  const secondaryNavLinks: NavLinkItem[] = [
    { href: "/custom-order", label: t.customOrderLink, hasBadge: true, badge: t.customBadge, highlight: true },
    { href: "/products?tag=sale", label: t.saleOffersLink, hasBadge: true, badge: t.newBadgeText },
    { href: "/products?category=غرف النوم", label: t.bedroomsLink },
    { href: "/products?category=المطابخ", label: t.kitchensLink },
    { href: "/products?category=كراسي مكتب", label: t.chairsAndDesksLink },
    { href: "/products?category=ركن ومجالس", label: t.livingAndLoungesLink },
    { href: "/products?category=أثاث خارجي", label: t.outdoorLink },
    { href: "/products?category=دريسنج روم", label: t.dressingRoomLink },
    { href: "/products?category=اضاءة", label: t.decorLink },
    { href: "/track", label: t.trackOrderLink, hasBadge: true, badge: t.trackBadge },
    { href: "/products", label: t.allFurnitureLink },
  ];

  // Filtered search results
  const results =
    query.trim().length >= 2
      ? products
          .filter((p) => {
            const matchesCat =
              selectedCategory === "all" ||
              p.category.toLowerCase().includes(selectedCategory.toLowerCase());
            const q = query.toLowerCase();
            const matchesQuery =
              p.name.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.material.toLowerCase().includes(q) ||
              p.tags.some((tg) => tg.toLowerCase().includes(q));
            return matchesCat && matchesQuery;
          })
          .slice(0, 6)
      : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSearchDropdown(false);
      const catParam =
        selectedCategory !== "all"
          ? `&category=${encodeURIComponent(selectedCategory)}`
          : "";
      router.push(`/products?search=${encodeURIComponent(query.trim())}${catParam}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-white shadow-xs border-b border-gray-100">
        {/* ── 1. Top Announcement Bar (Compact & Sleek) ────────────────── */}
        <div className="bg-neutral-50/80 border-b border-gray-100 text-xs py-1 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Currency, Language & Theme Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              <LanguageSwitcher />
              <div className="h-3 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
              <span className="hidden sm:inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 font-semibold text-[11px]">
                <span>{language === "sa" ? "🇸🇦 SAR" : language === "en" ? "🇺🇸 USD" : "🇪🇬 EGP"}</span>
              </span>
              <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
              <ThemeToggle variant="minimal" />
            </div>

            {/* Quick Promo / Factory Trust Line */}
            <div className="hidden md:flex items-center gap-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              <span>{isEn ? "Free White-Glove Delivery & 10-Year Warranty" : "توصيل وتركيب مجاني 100% | ضمان 10 سنوات معتمد"}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a href="tel:+201091084863" className="hover:text-accent transition-colors" dir="ltr">
                +20 109 1084863
              </a>
            </div>
          </div>
        </div>

        {/* ── 2. Main Header Row (Aligned, Balanced Spacing) ───────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center shrink-0 group py-0.5">
              <div className="relative h-9 sm:h-10 w-32 sm:w-40 transition-transform duration-200 group-hover:scale-[1.02]">
                <Image
                  src="/amazon-furniture-logo-clean.png"
                  alt={SITE_NAME}
                  fill
                  sizes="(max-width: 640px) 128px, 160px"
                  className="object-contain object-right"
                  priority
                />
              </div>
            </Link>

            {/* Center: Flexible Responsive Pill Search Bar */}
            <div ref={searchRef} className="flex-1 min-w-0 max-w-2xl relative hidden md:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-full border border-gray-300 hover:border-gray-400 focus-within:border-black bg-white p-1 pl-1 pr-2.5 shadow-2xs transition-colors"
              >
                {/* Search Button */}
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm px-5 py-1.5 rounded-full transition-colors shrink-0 cursor-pointer"
                >
                  {t.searchBtn}
                </button>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={t.searchPlaceholderNavbar}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className={`flex-1 min-w-0 px-3 py-1 text-sm text-primary placeholder:text-gray-400 outline-none bg-transparent font-medium ${
                    language === "en" ? "text-left" : "text-right"
                  }`}
                />

                {/* Vertical Divider */}
                <div className="h-4 w-px bg-gray-200 shrink-0" />

                {/* Category Dropdown */}
                <div className="relative bg-transparent shrink-0 max-w-[130px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-transparent text-xs font-bold text-gray-700 py-1 ps-2 pe-5 cursor-pointer outline-none truncate"
                  >
                    {searchCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={11}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </form>

              {/* Live Search Autocomplete Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && query.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[380px] overflow-y-auto"
                  >
                    {results.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        {t.noSearchResults} &ldquo;{query}&rdquo;
                      </div>
                    ) : (
                      <div className="py-2">
                        {results.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setQuery("");
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/60 transition-colors"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-primary truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                            <div className="text-left shrink-0">
                              <p className="text-sm font-bold text-amber-700" suppressHydrationWarning>
                                {formatPrice(product.price)}
                              </p>
                              {product.originalPrice && (
                                <p className="text-[11px] text-gray-400 line-through" suppressHydrationWarning>
                                  {formatPrice(product.originalPrice)}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Left Actions: Oscar Style Minimal Icons (Profile, Wishlist, Cart) */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* User Account */}
              <Link
                href={user ? "/profile" : "/auth/login"}
                className="p-1 text-gray-800 hover:text-black transition-colors flex items-center gap-1"
                title={user ? `${t.myAccount} (${user.name})` : t.login}
              >
                <User size={24} strokeWidth={1.8} />
                {user && (
                  <span className="hidden xl:inline text-[11px] font-bold text-stone-800 max-w-[90px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-1 text-gray-800 hover:text-black transition-colors"
                title={t.wishlist}
              >
                <Heart size={24} strokeWidth={1.8} />
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {hydrated ? wishlistItems.length : 0}
                </span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-1 text-gray-800 hover:text-black transition-colors"
                title={t.cart}
              >
                <ShoppingBag size={24} strokeWidth={1.8} />
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {hydrated ? itemCount : 0}
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-1.5 text-gray-700 hover:text-primary"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search input for small screens */}
          <div className="mt-2.5 md:hidden relative">
            <form onSubmit={handleSearchSubmit} className="flex rounded-full border border-gray-300 p-1 bg-white overflow-hidden shadow-xs">
              <button type="submit" className="bg-black text-white px-4 py-1.5 rounded-full font-bold text-xs">
                {t.searchBtn}
              </button>
              <input
                type="text"
                placeholder={t.searchPlaceholderNavbar}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className={`flex-1 px-3 py-1.5 text-xs outline-none font-medium ${
                  language === "en" ? "text-left" : "text-right"
                }`}
              />
            </form>

            {/* Mobile search dropdown */}
            <AnimatePresence>
              {showSearchDropdown && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                >
                  {results.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      لا توجد نتائج مطابقة لـ &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    <div className="py-2">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setQuery("");
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/60 transition-colors border-b border-gray-50 last:border-none"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.jpg"}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {product.category}
                            </p>
                          </div>
                          <div className="text-left shrink-0">
                            <p className="text-xs font-bold text-amber-700">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── 3. Secondary Sub-Navbar (Centered, Refined Typography & Smooth Scroll) ──────── */}
        <nav className="bg-[#151922] text-white border-t border-[#2A3140] shadow-xs overflow-x-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-start lg:justify-center min-w-max lg:min-w-0 h-10">
            {/* Category Links with responsive gaps */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 mx-auto px-2">
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative py-1 text-xs sm:text-[13px] font-bold text-gray-200 tracking-wide hover:text-white transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="relative">
                    {link.label}
                    {/* Refined subtle underline hover indicator */}
                    <span className="absolute -bottom-0.5 right-0 left-0 h-[2px] bg-[#C6A46A] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-right rounded-full" />
                  </span>
                  {link.hasBadge && (
                    <span className="bg-[#e60000] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Utility Link */}
            <Link
              href="/#consultation"
              className="hidden 2xl:flex items-center absolute left-6 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap"
            >
              {isEn ? "Free 3D Mockup ✨" : "شوف مساحتك قبل التنفيذ ✨"}
            </Link>
          </div>
        </nav>

        {/* ── 4. Mobile Drawer Menu (All Store Pages Included) ─────────── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200 shadow-xl overflow-hidden"
            >
              <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link
                  href="/#consultation"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm py-3 rounded-xl shadow-md"
                >
                  <Ruler size={17} />
                  <span>شوف مساحتك قبل التنفيذ (استشارة مجانية بالمنصورة)</span>
                </Link>

                {/* Core Store Navigation Pages */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 border border-slate-200/60"
                  >
                    <span>🛍️ جميع المعروضات</span>
                  </Link>

                  <Link
                    href="/products?tag=sale"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 flex items-center justify-center gap-1.5 border border-red-200/60"
                  >
                    <span>🔥 عروض الخصومات</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 border border-slate-200/60"
                  >
                    <span>📦 تتبع طلباتي</span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 border border-slate-200/60"
                  >
                    <span>🛒 سلة المشتريات ({hydrated ? itemCount : 0})</span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 border border-slate-200/60"
                  >
                    <span>🏢 عن المصنع والمعرض</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 border border-slate-200/60"
                  >
                    <span>📍 فروعنا بالمنصورة</span>
                  </Link>
                </div>

                {/* Categories List */}
                <div className="pt-2 pb-1 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 mb-2">أقسام الأثاث المتخصصة</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {secondaryNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                          link.highlight 
                            ? "text-red-600 font-bold bg-red-50"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account & Admin */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-primary hover:text-amber-700"
                  >
                    {user ? `👤 مرحباً، ${user.name}` : "تسجيل الدخول / إنشاء حساب"}
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-slate-500 hover:text-primary bg-slate-100 px-2.5 py-1 rounded-md"
                  >
                    لوحة الإدارة ⚙️
                  </Link>
                </div>

                {/* Direct WhatsApp Callout */}
                <div className="pt-2">
                  <a
                    href="https://wa.me/201091084863"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                  >
                    <span>واتساب أ. محمد إسماعيل (+20 109 1084863)</span>
                  </a>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-xs text-gray-500">اللغة / Language</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
