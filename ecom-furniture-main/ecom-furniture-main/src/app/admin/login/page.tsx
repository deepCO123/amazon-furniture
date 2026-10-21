"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // توجيه تلقائي لصفحة تسجيل الدخول الموحدة للمتجر
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0c0e14] text-white flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-300">جاري التوجيه إلى صفحة تسجيل الدخول الموحدة...</p>
      </div>
    </div>
  );
}
