"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "يرجى إدخال البريد الإلكتروني")
    .refine(
      (val) => val.includes("@") || val.toLowerCase().trim() === "admin",
      "يرجى كتابة بريد إلكتروني صحيح أو admin"
    ),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { language } = useLanguageStore();
  const isEn = language === "en";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    const result = await login(data.email, data.password);
    if (result.success) {
      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      setError(
        result.message ||
          (isEn
            ? "Invalid login credentials. Please check your email and password."
            : "بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.")
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4">
      <AnimatedSection className="w-full max-w-md">
        <div className="bg-white dark:bg-[#151D2A] rounded-2xl p-8 border border-surface-dark shadow-sm">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group" aria-label="AMAZON">
              <Image
                src="/logo/amazon-logo-bronze.svg"
                alt="AMAZON"
                width={160}
                height={80}
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
            <h1 className="text-2xl font-bold text-primary">
              {isEn ? "Sign In" : "تسجيل الدخول"}
            </h1>
            <p className="text-muted mt-1 text-sm">
              {isEn
                ? "Sign in to your AMAZON account (Customers & Admins)"
                : "سجل دخولك لحسابك في AMAZON (عملاء أو مسؤولين)"}
            </p>
          </div>

          {/* Google 1-Click Login Button */}
          <div className="mb-6">
            <GoogleAuthButton
              text={isEn ? "Sign in with Google" : "تسجيل الدخول السريع بـ Google"}
              onSuccess={() => router.push("/")}
            />
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-dark" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#151D2A] text-xs text-muted uppercase font-semibold">
                {isEn ? "Or with email and password" : "أو بالبريد وكلمة المرور"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-danger"
              >
                {error}
              </motion.div>
            )}

            <Input
              label={isEn ? "Email Address" : "البريد الإلكتروني"}
              type="text"
              placeholder={isEn ? "client@amazonfurniture.eg or admin" : "client@amazonfurniture.eg أو admin"}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label={isEn ? "Password" : "كلمة المرور"}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" size="lg" className="w-full font-bold" loading={loading}>
              {isEn ? "Sign In" : "تسجيل الدخول"}
            </Button>
          </form>

          {/* Quick Admin Demo Fill Shortcut */}
          <div className="mt-4 p-2.5 bg-slate-50 dark:bg-[#0D121B] border border-slate-200 dark:border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="text-[11px]">{isEn ? "System Administrator?" : "هل أنت مسؤول النظام؟"}</span>
            <button
              type="button"
              onClick={() => {
                setValue("email", "admin@amazonfurniture.eg");
                setValue("password", "Admin@Pass2026!");
                setError("");
              }}
              className="text-[#C58B45] hover:text-[#93662a] font-bold text-[11px] underline cursor-pointer"
            >
              {isEn ? "Autofill Admin Credentials ⚡" : "تعبئة بيانات الأدمن تلقائياً ⚡"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              {isEn ? "Don't have an account? " : "ليس لديك حساب؟ "}
              <Link
                href="/auth/register"
                className="text-accent hover:text-accent-dark font-bold underline"
              >
                {isEn ? "Create new account" : "إنشاء حساب جديد"}
              </Link>
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
