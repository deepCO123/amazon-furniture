"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function NewNewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 600);
  };

  return (
    <section className="w-full bg-[#FAF7F2] dark:bg-[#120E0B] py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#EDE3D6] via-[#F6EEE4] to-[#EDE3D6] dark:from-[#2A1F17] dark:via-[#221812] dark:to-[#1C130D] border border-[#DDD0BF] dark:border-[#38261A] shadow-sm min-h-[140px] sm:min-h-[160px] flex items-center justify-between">
          {/* Decorative Wood Credenza & Plant on Left (Matching Image 3) */}
          <div className="hidden md:block absolute left-0 bottom-0 top-0 w-48 lg:w-60 z-0 pointer-events-none">
            <Image
              src="/redesign/newsletter-credenza.png"
              alt="ديكور منزلي"
              fill
              className="object-contain object-left-bottom"
              sizes="240px"
            />
          </div>

          {/* Decorative Hanging % Discount Tag on Right (Matching Image 3) */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-32 lg:w-40 z-0 pointer-events-none">
            <Image
              src="/redesign/newsletter-tag.png"
              alt="عروض وتخفيضات"
              fill
              className="object-contain object-right"
              sizes="160px"
            />
          </div>

          {/* Inner Content Centered Between Side Visuals */}
          <div className="relative z-10 w-full px-4 sm:px-12 md:px-36 lg:px-44 py-6 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Right: Typography */}
            <div className="text-center lg:text-right">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#2B1E16] dark:text-[#F0EBE5]">
                اشترك في نشرتنا البريدية
              </h3>
              <p className="text-xs sm:text-sm text-[#7A6B60] dark:text-[#D4A373] font-medium mt-1">
                احصل على أحدث العروض والأخبار أولاً بأول
              </p>
            </div>

            {/* Left: Input Form Pill */}
            <div className="w-full max-w-md">
              {subscribed ? (
                <div className="bg-white/90 dark:bg-[#1C1612]/90 backdrop-blur-xs rounded-full py-2.5 px-5 flex items-center justify-center gap-2 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>شكراً لاشتراكك! ستصلك أحدث العروض قريباً.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="relative flex items-center bg-white dark:bg-[#1C1612] rounded-full p-1.5 border border-[#D6C5B3] dark:border-[#38261A] shadow-[0_2px_12px_rgba(43,30,22,0.06)] focus-within:border-[#A3704C] transition-colors"
                >
                  {/* Subscribe Button on Left: Caramel #B07836 with Paper Plane icon */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#B07836] hover:bg-[#97642A] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full shadow-xs transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? "..." : "اشترك الآن"}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  {/* Input on Right */}
                  <div className="flex-1 relative flex items-center px-3">
                    <input
                      type="email"
                      required
                      placeholder="أدخل بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm text-[#2B1E16] dark:text-white placeholder:text-gray-400 bg-transparent outline-none text-right font-medium"
                    />
                    <Mail className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
