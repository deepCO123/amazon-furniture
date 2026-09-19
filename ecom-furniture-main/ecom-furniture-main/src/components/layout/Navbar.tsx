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
import { useToastStore } from "@/components/ui/Toast";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { formatPrice, cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const products = useProductStore((s) => s.products);
  const addToast = useToastStore((s) => s.addToast);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("كل الأقسام");
  const [query, setQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistItems = useWishlistStore((s) => s.items);
  const user = useAuthStore((s) => s.user);

  // Search categories matching store
  const searchCategories = [
    "كل الأقسام",
    "غرفة نوم كاملة",
    "ركن ومجالس",
    "كراسي مكتب",
    "مكاتب",
    "أثاث خارجي",
    "مطبخ كامل",
    "دريسنج",
    "ترابيزة تليفزيون",
    "ستائر مكتبية",
    "ليزي بوي",
  ];

  interface NavLinkItem {
    href: string;
    label: string;
    hasBadge?: boolean;
    badge?: string;
    highlight?: boolean;
  }

  // Secondary dark bar navigation links matching Oscar Screenshot 1
  const secondaryNavLinks: NavLinkItem[] = [
    { href: "/products?tag=sale", label: "عروض أمازون", hasBadge: true, badge: "New", highlight: true },
    { href: "/products", label: "أثاث" },
    { href: "/products?category=أثاث خارجي", label: "أثاث خارجي" },
    { href: "/products?category=كراسي مكتب", label: "أثاث مكتبي" },
    { href: "/products?category=مطبخ كامل", label: "المطبخ" },
    { href: "/products?category=اضاءة", label: "ديكور واكسسور" },
    { href: "/products?category=سرير مودرن", label: "غرفة طفلك" },
    { href: "/products?category=ستائر مكتبية", label: "مفروشات" },
  ];

  // Filtered search results
  const results =
    query.trim().length >= 2
      ? products
          .filter((p) => {
            const matchesCat =
              selectedCategory === "كل الأقسام" ||
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
        selectedCategory !== "كل الأقسام"
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
      {/* ── Sticky Side Promo Tab (Oscar-style) ────────────────────────── */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden sm:block">
        <button
          onClick={() => setShowPromoModal(true)}
          className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs px-2.5 py-3 rounded-r-xl shadow-lg hover:from-red-500 hover:to-amber-500 transition-all flex flex-col items-center gap-1.5 [writing-mode:vertical-rl] tracking-wider"
          title="عرض خاص 🎁"
        >
          <span>عرض خاص 🎁</span>
        </button>
      </div>

      {/* ── Promo Modal Popup ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showPromoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-amber-500/30 text-center"
            >
              <button
                onClick={() => setShowPromoModal(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-lg">
                🎁
              </div>

              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-2">
                عرض حصري لفترة محدودة
              </span>

              <h3 className="text-xl font-bold text-primary mb-2">
                خصم إضافي 50% + توصيل وتركيب مجاني!
              </h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                استخدم كود الخصم في سلة المشتريات أو عند الطلب عبر الواتساب للاستفادة من أقوى عروض Amazon Furniture من المصنع لحد باب بيتك:
              </p>

              <div className="flex items-center justify-between bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl px-4 py-3 mb-6">
                <span className="font-mono text-xl font-black text-red-600 tracking-widest">
                  AMZ50
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("AMZ50");
                    addToast("تم نسخ كود الخصم بنجاح: AMZ50", "success");
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  نسخ الكود
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/products?tag=sale"
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 bg-primary hover:bg-primary-light text-white font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  تسوق العروض الآن
                </Link>
                <Link
                  href="/#consultation"
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Ruler size={16} />
                  استشارة ومعاينة مجانية
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-100">
        {/* ── 1. Top Announcement Bar (Oscar-Style) ───────────────────── */}
        <div className="bg-white border-b border-gray-100 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Currency & Language Controls on Left */}
            <div className="flex items-center gap-3 shrink-0">
              <LanguageSwitcher />
              <div className="h-3 w-px bg-gray-200 hidden md:block" />
              <span className="hidden md:inline-flex items-center gap-1 text-gray-700 font-semibold text-xs">
                <span>🇪🇬 EGP</span>
              </span>
            </div>

            {/* Promo Text in Center (Red in Oscar) */}
            <div className="flex-1 text-center">
              <p className="text-[#e60000] font-bold text-xs sm:text-sm">
                احصل علي خصم 50 % باستخدام كود:{" "}
                <span className="font-mono font-black">AMZ50</span> ⚡{" "}
                <Link href="/products?tag=sale" className="hover:underline text-[#e60000]">
                  تسوق الآن
                </Link>
              </p>
            </div>

            <div className="hidden md:block w-28" />
          </div>
        </div>

        {/* ── 2. Main Header Row (Oscar Layout) ───────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Right: Brand Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-xs border border-amber-300 group-hover:border-amber-500 transition-all duration-300">
                <Image
                  src="/logo-icon.png"
                  alt={SITE_NAME}
                  fill
                  sizes="48px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight group-hover:text-amber-700 transition-colors">
                  {SITE_NAME}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-amber-700 font-bold mt-0.5">
                  من المصنع لحد باب البيت
                </span>
              </div>
            </Link>

            {/* Center: Exact Oscar Pill Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-2xl relative hidden md:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-full border border-gray-300 hover:border-gray-400 focus-within:border-black bg-white p-1 pl-1 pr-3 shadow-xs transition-colors"
              >
                {/* Search Button (Black Pill Button on Left in RTL) */}
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm px-6 py-2 rounded-full transition-colors shrink-0 cursor-pointer"
                >
                  بحث
                </button>

                {/* Search Input in Middle */}
                <input
                  type="text"
                  placeholder="بحث عن منتجات"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="flex-1 px-4 py-1 text-sm text-primary placeholder:text-gray-400 outline-none text-right bg-transparent font-medium"
                />

                {/* Vertical Divider */}
                <div className="h-5 w-px bg-gray-200" />

                {/* Category Dropdown on Right */}
                <div className="relative bg-transparent shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-transparent text-xs font-bold text-gray-700 py-1.5 ps-2 pe-6 cursor-pointer outline-none"
                  >
                    {searchCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
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
                              <p className="text-sm font-bold text-amber-700">
                                {formatPrice(product.price)}
                              </p>
                              {product.originalPrice && (
                                <p className="text-[11px] text-gray-400 line-through">
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
                href="/auth/login"
                className="p-1 text-gray-800 hover:text-black transition-colors"
                title={user ? user.name : "تسجيل الدخول / حسابي"}
              >
                <User size={24} strokeWidth={1.8} />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-1 text-gray-800 hover:text-black transition-colors"
                title="قائمة الرغبات"
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
                title="سلة المشتريات"
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
                بحث
              </button>
              <input
                type="text"
                placeholder="بحث عن منتجات (ركنة، سرير، مكتب...)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="flex-1 px-3 py-1.5 text-xs outline-none text-right font-medium"
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

        {/* ── 3. Secondary Dark Sub-Navbar (Oscar Layout - Scrollable on mobile) ──────── */}
        <nav className="bg-[#1e1e1e] text-white border-t border-neutral-800 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-w-max lg:min-w-0 h-10 sm:h-11 gap-4">
            {/* Right: Category Links */}
            <div className="flex items-center gap-3 sm:gap-4 xl:gap-6 shrink-0">
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative py-1 text-xs font-bold text-gray-200 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>{link.label}</span>
                  {link.hasBadge && (
                    <span className="bg-[#e60000] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Left: "شوف مساحتك قبل التنفيذ" in clean text style */}
            <Link
              href="/#consultation"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 border-r border-neutral-700 pr-3 lg:border-none"
            >
              شوف مساحتك قبل التنفيذ ✨
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
