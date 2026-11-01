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
  Search,
  LayoutGrid,
  Phone,
  MapPin,
  MessageCircle,
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
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
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

  // Strictly organized corporate & executive office solutions menu matching architecture
  const secondaryNavLinks: NavLinkItem[] = [
    {
      href: "/products?category=" + encodeURIComponent("مكاتب"),
      label: language === "en" ? "Executive Desks" : "مكاتب تنفيذية",
      hasBadge: true,
      badge: "VIP",
    },
    {
      href: "/products?category=" + encodeURIComponent("كراسي طبية"),
      label: language === "en" ? "Ergonomic Chairs" : "كراسي شبك طبية",
      hasBadge: true,
      badge: "الأكثر طلباً",
    },
    {
      href: "/products?category=" + encodeURIComponent("كراسي جلد"),
      label: language === "en" ? "Manager Leather Chairs" : "كراسي جلد للمديرين",
    },
    {
      href: "/products?category=" + encodeURIComponent("ستائر مكتبية"),
      label: language === "en" ? "Office Blinds" : "ستائر مكتبية",
    },
    {
      href: "/products?category=" + encodeURIComponent("انتريهات"),
      label: language === "en" ? "Reception Lounge" : "أثاث استقبال وانتظار",
    },
    {
      href: "/custom-order",
      label: language === "en" ? "Custom Sizing 3D" : "تفصيل مقاسات 3D",
      hasBadge: true,
      badge: "مجاناً",
    },
  ];

  const allCategoriesList = [
    { name: "مكاتب تنفيذية ومحطات عمل", category: "مكاتب", count: "12 منتج" },
    { name: "كراسي طبية وشبكية إرجونوميك", category: "كراسي طبية", count: "18 منتج" },
    { name: "كراسي جلد فاخرة للمديرين", category: "كراسي جلد", count: "14 منتج" },
    { name: "ستائر مكتبية عازلة وموتورايزد", category: "ستائر مكتبية", count: "8 منتجات" },
    { name: "كاونترات استقبال وأثاث انتظار", category: "انتريهات", count: "10 منتجات" },
    { name: "دواليب ووحدات حفظ ملفات", category: "دواليب", count: "9 منتجات" },
    { name: "ركن واستراحات مكاتب", category: "ركن", count: "11 منتج" },
    { name: "كراسي استرخاء ليزي بوي", category: "ليزي بوي", count: "6 منتجات" },
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
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategoryMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowSearchDropdown(false);
        setShowCategoryMenu(false);
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
      <header className="sticky top-0 left-0 right-0 z-40 bg-white shadow-xs border-b border-[#CCD0CF]">
        {/* ── 1. Top Hotline & Showroom Bar (Executive Corporate Styling #1F2421 / Gold) ─────────────── */}
        <div className="bg-[#1F2421] text-white text-xs py-1.5 px-4 border-b border-[#2D3430]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs">
            {/* Showroom Address & Hotline (Right side in RTL) */}
            <div className="flex items-center gap-3 sm:gap-6 font-semibold">
              <a
                href="tel:01012345678"
                className="flex items-center gap-1.5 text-white/95 hover:text-[#C59B63] transition-colors"
                title="الخط الساخن والمبيعات"
              >
                <Phone className="w-3.5 h-3.5 text-[#C59B63]" />
                <span dir="ltr" className="font-bold">01012345678</span>
              </a>

              <span className="text-white/20 hidden md:inline">|</span>

              <div className="hidden sm:flex items-center gap-1.5 text-white/80">
                <MapPin className="w-3.5 h-3.5 text-[#C59B63]" />
                <span>المنصورة - حي الجامعة بجوار كلية الهندسة</span>
              </div>
            </div>

            {/* WhatsApp Quick Consultation & Tools (Left side in RTL) */}
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="https://wa.me/201012345678?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D9%84%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%85%D9%83%D8%AA%D8%A8%20%D8%A3%D9%88%20%D8%B4%D8%B1%D9%83%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#4ADE80] px-2.5 py-0.5 rounded-full font-bold transition-all border border-[#25D366]/40"
              >
                <MessageCircle className="w-3 h-3 text-[#25D366]" />
                <span>استشارة واتساب فورية</span>
              </a>

              <span className="text-white/20 hidden sm:inline">|</span>
              <LanguageSwitcher />
              <ThemeToggle variant="minimal" />
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
                className="h-[38px] sm:h-[46px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] dark:hidden"
                priority
              />
              <Image
                src="/logo/amazon-horizontal-white.svg"
                alt="AMAZON"
                width={180}
                height={46}
                className="h-[38px] sm:h-[46px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] hidden dark:block"
                priority
              />
            </Link>

            {/* Center: Flexible Responsive Pill Search Bar */}
            <div ref={searchRef} className="flex-1 min-w-0 max-w-2xl relative hidden md:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-full border border-[#E8E0D5] dark:border-[#2C3549] hover:border-[#253745] focus-within:border-[#11212D] bg-white dark:bg-[#151A24] p-1 pl-1 pr-2.5 shadow-2xs transition-colors"
              >
                {/* Search Button */}
                <button
                  type="submit"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1F2421] hover:bg-[#C59B63] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs"
                  aria-label={t.searchBtn}
                >
                  <Search className="w-4 h-4" />
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
                  className={`flex-1 min-w-0 px-3 py-1 text-sm text-primary dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#79859A] outline-none bg-transparent font-medium ${
                    language === "en" ? "text-left" : "text-right"
                  }`}
                />

                {/* Vertical Divider */}
                <div className="h-4 w-px bg-gray-200 dark:bg-[#2C3549] shrink-0" />

                {/* Category Dropdown */}
                <div className="relative bg-transparent shrink-0 max-w-[130px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-transparent text-xs font-bold text-gray-700 dark:text-slate-200 py-1 ps-2 pe-5 cursor-pointer outline-none truncate"
                  >
                    {searchCategories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-white dark:bg-[#151A24] text-gray-900 dark:text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={11}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
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
                    className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#151A24] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2C3549] overflow-hidden z-50 max-h-[380px] overflow-y-auto"
                  >
                    {results.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
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
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1E2536] shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-primary dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                            </div>
                            <div className="text-left shrink-0">
                              <p className="text-sm font-bold text-amber-700 dark:text-[#E8D4B0]" suppressHydrationWarning>
                                {formatPrice(product.price)}
                              </p>
                              {product.originalPrice && (
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 line-through" suppressHydrationWarning>
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
                prefetch={true}
                className="p-1 text-gray-800 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
                title={user ? `${t.myAccount} (${user.name})` : t.login}
              >
                <User size={24} strokeWidth={1.8} />
                {user && (
                  <span className="hidden xl:inline text-[11px] font-bold text-stone-800 dark:text-slate-200 max-w-[90px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                prefetch={true}
                className="relative p-1 text-gray-800 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors"
                title={t.wishlist}
              >
                <Heart size={24} strokeWidth={1.8} />
                <span className="absolute -top-1.5 -right-1.5 bg-black dark:bg-[#B93832] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {hydrated ? wishlistItems.length : 0}
                </span>
              </Link>

              {/* Cart - Always Visible */}
              <Link
                href="/cart"
                prefetch={true}
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-gray-800 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors"
                title={t.cart}
                aria-label={t.cart}
              >
                <ShoppingBag size={24} strokeWidth={1.8} />
                <span className="absolute top-1 end-1 bg-black dark:bg-[#253745] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {hydrated ? itemCount : 0}
                </span>
              </Link>

              {/* Mobile Menu Button (Hamburger) */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl text-gray-700 dark:text-slate-200 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="قائمة التصفح"
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search input for small screens */}
          <div className="mt-2.5 md:hidden relative">
            <form onSubmit={handleSearchSubmit} className="flex rounded-full border border-gray-300 dark:border-[#2C3549] p-1 bg-white dark:bg-[#151A24] overflow-hidden shadow-xs">
              <button type="submit" className="bg-black dark:bg-[#253745] text-white px-4 py-1.5 rounded-full font-bold text-xs">
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
                className={`flex-1 px-3 py-1.5 text-xs outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#79859A] bg-transparent ${
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
                  className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#151A24] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2C3549] overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                >
                  {results.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
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
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors border-b border-gray-50 dark:border-[#232B3C] last:border-none"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1E2536] shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.jpg"}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              {product.category}
                            </p>
                          </div>
                          <div className="text-left shrink-0">
                            <p className="text-xs font-bold text-amber-700 dark:text-[#E8D4B0]">
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

        {/* ── 3. Category Navigation Row with Direct Buy Links & All Categories Dropdown ──────── */}
        <nav className="bg-white dark:bg-[#151A24] text-[#292321] dark:text-[#F5F6F8] border-t border-b border-[#EDE6DD] dark:border-[#38261A] shadow-2xs relative z-30">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-11 gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            {/* Right: "تسوق حسب التصنيف" with Dropdown */}
            <div ref={categoryRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center gap-1.5 text-[#1F2421] dark:text-[#C59B63] hover:text-[#C59B63] font-black text-xs sm:text-[13px] whitespace-nowrap transition-colors px-2.5 py-1 rounded-lg hover:bg-[#FAF4ED] dark:hover:bg-[#1E2536] cursor-pointer"
              >
                <LayoutGrid size={15} className="text-[#C59B63]" />
                <span>{language === "en" ? "Shop by Category" : "تسوق حسب التصنيف"}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 text-[#C59B63] ${showCategoryMenu ? "rotate-180" : ""}`} />
              </button>

              {/* All Categories Dropdown Menu */}
              <AnimatePresence>
                {showCategoryMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-[#1A202C] rounded-2xl shadow-2xl border border-[#E8DEC8] dark:border-[#38261A] p-2 z-50 overflow-hidden"
                  >
                    <div className="text-[11px] font-bold text-[#8C7A6B] dark:text-[#A7B0C0] px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
                      اختر القسم للشراء والتسوق المباشر:
                    </div>
                    <div className="py-1">
                      {allCategoriesList.map((cat) => (
                        <Link
                          key={cat.category}
                          href={`/products?category=${encodeURIComponent(cat.category)}`}
                          prefetch={true}
                          onClick={() => setShowCategoryMenu(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#1F2421] dark:text-[#F0EBE5] hover:bg-[#FAF4ED] dark:hover:bg-[#252E3E] hover:text-[#C59B63] transition-colors"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-gray-400 font-normal">{cat.count}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-4 w-px bg-[#E8E0D5] dark:bg-[#232B3C] shrink-0 hidden sm:block" />

            {/* Center / Left: Category Direct Links without confusing fake chevrons */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-1 justify-end sm:justify-start">
              {secondaryNavLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  prefetch={true}
                  className="group py-1 px-2 sm:px-2.5 rounded-lg text-xs sm:text-[13px] font-black text-[#1F2421] dark:text-[#F8F9FA] tracking-wide hover:text-[#C59B63] hover:bg-[#FAF4ED] dark:hover:bg-[#1E2536] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>{link.label}</span>
                  {link.hasBadge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs ${
                        link.badge === "VIP"
                          ? "bg-[#1F2421] text-[#E8D4B0] border border-[#C59B63]/60"
                          : link.badge === "الأكثر طلباً"
                          ? "bg-[#B93832] text-white"
                          : "bg-[#2B8A3E] text-white"
                      }`}
                    >
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
                className="lg:hidden relative z-40 bg-white dark:bg-[#121620] border-t border-gray-200 dark:border-[#232B3C] shadow-xl overflow-hidden"
              >
              <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link
                  href="/#consultation"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm py-3 rounded-xl shadow-md"
                >
                  <Ruler size={17} />
                  <span>
                    {language === "en"
                      ? "Free 3D Design Consultation & Site Visit"
                      : "شوف مساحتك قبل التنفيذ (استشارة مجانية بالمنصورة)"}
                  </span>
                </Link>

                {/* Core Store Navigation Pages */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#181E2B] hover:bg-slate-100 dark:hover:bg-[#1F2737] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-[#232B3C]"
                  >
                    <span>{language === "en" ? "🛍️ All Products" : "🛍️ جميع المعروضات"}</span>
                  </Link>

                  <Link
                    href="/products?tag=sale"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold text-red-700 dark:text-red-400 flex items-center justify-center gap-1.5 border border-red-200/60 dark:border-red-900/40"
                  >
                    <span>{language === "en" ? "🔥 Sale Offers" : "🔥 عروض الخصومات"}</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#181E2B] hover:bg-slate-100 dark:hover:bg-[#1F2737] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-[#232B3C]"
                  >
                    <span>{language === "en" ? "📦 Track Orders" : "📦 تتبع طلباتي"}</span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#181E2B] hover:bg-slate-100 dark:hover:bg-[#1F2737] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-[#232B3C]"
                  >
                    <span>
                      {language === "en"
                        ? `🛒 Cart (${hydrated ? itemCount : 0})`
                        : `🛒 سلة المشتريات (${hydrated ? itemCount : 0})`}
                    </span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#181E2B] hover:bg-slate-100 dark:hover:bg-[#1F2737] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-[#232B3C]"
                  >
                    <span>{language === "en" ? "🏢 About Factory" : "🏢 عن المصنع والمعرض"}</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#181E2B] hover:bg-slate-100 dark:hover:bg-[#1F2737] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-[#232B3C]"
                  >
                    <span>{language === "en" ? "📍 Showroom & Factory" : "📍 فروعنا بالمنصورة"}</span>
                  </Link>
                </div>

                {/* Categories List */}
                <div className="pt-2 pb-1 border-t border-gray-100 dark:border-[#232B3C]">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">
                    {language === "en" ? "Furniture Categories" : "أقسام الأثاث المتخصصة"}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {secondaryNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                          link.highlight 
                            ? "text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30"
                            : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#181E2B]"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account & Admin */}
                <div className="pt-2 border-t border-gray-100 dark:border-[#232B3C] flex items-center justify-between text-xs">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-primary dark:text-white hover:text-amber-700 dark:hover:text-[#E8D4B0]"
                  >
                    {user
                      ? (language === "en" ? `👤 Welcome, ${user.name}` : `👤 مرحباً، ${user.name}`)
                      : (language === "en" ? "Login / Register" : "تسجيل الدخول / إنشاء حساب")}
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-slate-500 dark:text-slate-300 hover:text-primary dark:hover:text-white bg-slate-100 dark:bg-[#181E2B] px-2.5 py-1 rounded-md"
                  >
                    {language === "en" ? "Admin Dashboard ⚙️" : "لوحة الإدارة ⚙️"}
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
                    <span>
                      {language === "en"
                        ? "Customer Support WhatsApp (+20 109 1084863)"
                        : "واتساب خدمة العملاء (+20 109 1084863)"}
                    </span>
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
