"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAdminAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        router.push("/admin");
      } else {
        setError(result.message || "بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني وكلمة المرور.");
      }
    } catch {
      setError("حدث خطأ غير متوقع أثناء تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard min-h-screen bg-[#F1F5F9] text-[#0F172A] flex flex-col items-center justify-center p-4 font-sans" dir="rtl" data-admin="true">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block" aria-label="AMAZON">
            <Image
              src="/logo/amazon-logo-bronze.svg"
              alt="AMAZON"
              width={180}
              height={90}
              className="h-20 w-auto mx-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
              priority
            />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              AMAZON
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              Premium Living Solutions • لوحة تحكم وإدارة المتجر
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs sm:text-sm">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Fill Demo Credentials */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-medium">بيانات الدخول الافتراضية:</span>
              <button
                type="button"
                onClick={() => {
                  setUsername("admin@amazonfurniture.eg");
                  setPassword("Admin@Pass2026!");
                }}
                className="text-[#2563EB] hover:underline font-bold cursor-pointer"
              >
                تعبئة تلقائية ⚡
              </button>
            </div>
            <div className="text-[#334155] font-mono text-[11px] space-y-0.5" dir="ltr">
              <div>User: <span className="text-[#2563EB] font-bold">admin@amazonfurniture.eg</span></div>
              <div>Pass: <span className="text-[#2563EB] font-bold">Admin@Pass2026!</span></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                اسم المستخدم / المسؤول
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم المعتمد"
                  className="w-full pl-3 pr-10 py-3 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-3 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] placeholder-slate-400 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>دخول لوحة التحكم</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to store */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowRight size={14} />
            <span>العودة لمتجر AMAZON</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
