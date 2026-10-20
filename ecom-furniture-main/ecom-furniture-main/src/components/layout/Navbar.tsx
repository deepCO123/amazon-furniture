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
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
    { value: "كراسي شبك", label: t.meshChairsLink },
    { value: "كراسي طبية", label: t.medicalChairsLink },
    { value: "ترابيزة تليفزيون", label: t.tvTablesLink },
    { value: "ستائر مكتبية", label: t.officeCurtainsLink },
    { value: "مكاتب", label: t.desksLink },
    { value: "انتريهات", label: t.livingSetsLink },
    { value: "كراسي جلد", label: t.leatherChairsLink },
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
    { href: "/products?category=كراسي شبك", label: t.meshChairsLink },
    { href: "/products?category=كراسي طبية", label: t.medicalChairsLink },
    { href: "/products?category=ترابيزة تليفزيون", label: t.tvTablesLink },
    { href: "/products?category=ستائر مكتبية", label: t.officeCurtainsLink },
    { href: "/products?category=مكاتب", label: t.desksLink },
    { href: "/products?category=انتريهات", label: t.livingSetsLink },
    { href: "/products?category=كراسي جلد", label: t.leatherChairsLink },
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-white shadow-xs border-b border-[#E8E0D5]">
        {/* ── 1. Primary Brown Sub-Bar (#6B4F3A with #C58B45 Gold Hover) ─────────────── */}
        <div className="bg-[#6B4F3A] text-white text-xs py-1.5 px-4 border-b border-[#83644D]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Social Media Icons (Left) */}
            <div className="flex items-center gap-3 text-white/90">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C58B45] transition-colors" title="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C58B45] transition-colors" title="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C58B45] transition-colors" title="YouTube">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/></svg>
              </a>
              <span className="text-white/30 hidden sm:inline">|</span>
              <LanguageSwitcher />
              <ThemeToggle variant="minimal" />
            </div>

            {/* Quick Links (Right) */}
            <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold text-white/90">
              <Link href="/about" className="hover:text-[#C58B45] transition-colors">من نحن</Link>
              <Link href="/contact" className="hover:text-[#C58B45] transition-colors">تواصل معنا</Link>
            </div>
          </div>
        </div>

        {/* ── 2. Main Header Row (Aligned, Balanced Spacing) ───────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
            {/* Brand Logo - 46px on desktop, 38-40px on mobile */}
            <Link href="/" className="flex items-center shrink-0 group py-0.5" aria-label="AMAZON">
              <Image
                src="/logo/amazon-horizontal-bronze.svg"
                alt="AMAZON"
                width={180}
                height={46}
                className="h-[38px] sm:h-[46px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                priority
              />
            </Link>

            {/* Center: Flexible Responsive Pill Search Bar */}
            <div ref={searchRef} className="flex-1 min-w-0 max-w-2xl relative hidden md:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-full border border-[#E8E0D5] hover:border-[#C58B45] focus-within:border-[#C58B45] bg-white p-1 pl-1 pr-2.5 shadow-2xs transition-colors"
              >
                {/* Search Button */}
                <button
                  type="submit"
                  className="bg-[#C58B45] hover:bg-[#B07836] text-white font-bold text-xs sm:text-sm px-5 py-1.5 rounded-full transition-colors shrink-0 cursor-pointer shadow-xs"
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

              {/* Cart - Always Visible */}
              <Link
                href="/cart"
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-gray-800 hover:text-black transition-colors"
                title={t.cart}
                aria-label={t.cart}
              >
                <ShoppingBag size={24} strokeWidth={1.8} />
                <span className="absolute top-1 end-1 bg-black text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {hydrated ? itemCount : 0}
                </span>
              </Link>

              {/* Mobile Menu Button (Hamburger) */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl text-gray-700 hover:text-primary hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="قائمة التصفح"
                aria-expanded={isOpen}
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

        {/* ── 3. SofaZone Category Navigation Row (White with Golden Header & Carets) ──────── */}
        <nav className="bg-white text-[#292321] border-t border-b border-[#E8E0D5] shadow-2xs overflow-x-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-11 gap-4 sm:gap-6 min-w-max">
            {/* Right: "تسوق حسب التصنيف" */}
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-[#C58B45] hover:text-[#B07836] font-black text-xs sm:text-sm whitespace-nowrap transition-colors shrink-0"
            >
              <Sparkles size={14} className="text-[#C58B45]" />
              <span>تسوق حسب التصنيف</span>
              <ChevronDown size={13} />
            </Link>

            <div className="h-4 w-px bg-[#E8E0D5] shrink-0" />

            {/* Center: Category Links with Carets */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative py-1 text-xs sm:text-[13px] font-black text-[#292321] tracking-wide hover:text-[#C58B45] transition-all flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <span>{link.label}</span>
                  <ChevronDown size={11} className="text-[#74685E] group-hover:text-[#C58B45] transition-colors" />
                  {link.hasBadge && (
                    <span className="bg-[#B93832] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* ── 4. Mobile Drawer Menu (All Store Pages Included) ─────────── */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden relative z-40 bg-white border-t border-gray-200 shadow-xl overflow-hidden"
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
                    <span>واتساب خدمة العملاء (+20 109 1084863)</span>
                  </a>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-xs text-gray-500">اللغة / Language</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
