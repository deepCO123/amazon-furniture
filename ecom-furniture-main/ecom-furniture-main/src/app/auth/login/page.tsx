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
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    const result = await login(data.email, data.password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.message || "بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4">
      <AnimatedSection className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-surface-dark shadow-sm">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-accent/40 group-hover:border-accent transition-all duration-300">
                <Image
                  src="/logo-icon.png"
                  alt="Amazon Furniture"
                  fill
                  priority
                  sizes="56px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-primary">تسجيل الدخول / Sign In</h1>
            <p className="text-muted mt-1 text-sm">سجل دخولك لحسابك في Amazon Furniture</p>
          </div>

          {/* Google 1-Click Login Button */}
          <div className="mb-6">
            <GoogleAuthButton
              text="تسجيل الدخول السريع بـ Google"
              onSuccess={() => router.push("/")}
            />
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-dark" />
              </div>
              <span className="relative px-3 bg-white text-xs text-muted uppercase font-semibold">
                أو بالبريد وكلمة المرور
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger"
              >
                {error}
              </motion.div>
            )}

            <Input
              label="البريد الإلكتروني / Email"
              type="email"
              placeholder="client@amazonfurniture.eg أو john@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="كلمة المرور / Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" size="lg" className="w-full font-bold" loading={loading}>
              تسجيل الدخول / Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              ليس لديك حساب؟{" "}
              <Link
                href="/auth/register"
                className="text-accent hover:text-accent-dark font-bold underline"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

