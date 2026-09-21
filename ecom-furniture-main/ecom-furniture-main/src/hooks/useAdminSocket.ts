"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useToastStore } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

export interface NewOrderEventPayload {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  itemsCount?: number;
  createdAt?: string;
}

/**
 * تشغيل نغمة تنبيه صوتية عند وصول طلب جديد
 * يحاول تشغيل ملف mp3، مع توليد نغمة ثنائية نقية عبر Web Audio API كبديل فوري وموثوق
 */
const playNotificationChime = () => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: استخدام Web Audio API في حال عدم وجود ملف mp3 أو حظر المسار
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration);
        };

        playTone(587.33, 0, 0.2);     // D5
        playTone(880.0, 0.15, 0.35);   // A5
      });
    }
  } catch {
    // Autoplay policy or unsupported audio
  }
};

/**
 * Custom Hook للاتصال الآمن بـ Socket.io للوحة تحكم الأدمن
 * يستمع لحدث وصول الطلبات الجديدة (new_order) ويبث إشعاراً صوتياً ومرئياً
 */
export function useAdminSocket(onNewOrder?: (order: NewOrderEventPayload) => void) {
  const socketRef = useRef<Socket | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    // إنشاء اتصال Socket.io مع إرسال الكوكيز (HttpOnly) للمصادقة في admin_room
    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("⚡ [Admin Socket] تم الاتصال بخادم الإشعارات بنجاح:", socket.id);
    });

    socket.on("new_order", (data: NewOrderEventPayload) => {
      console.log("🔔 [Admin Socket] وصل إشعار طلب جديد لحظياً:", data);

      // 1. تشغيل التنبيه الصوتي
      playNotificationChime();

      // 2. إظهار الإشعار المرئي (Toast Notification)
      const formattedTotal = formatPrice(data.total);
      const customer = data.customerName || "عميل جديد";
      addToast(
        `🎉 طلب شراء جديد #${data.orderId} من ${customer} بإجمالي ${formattedTotal}!`,
        "success"
      );

      // 3. تحديث واجهة الداشبورد والبيانات فورياً
      if (onNewOrder) {
        onNewOrder(data);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 [Admin Socket] انقطع الاتصال:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ [Admin Socket] خطأ في الاتصال بالسوكيت:", err.message);
    });

    // تنظيف الاتصال عند مغادرة الصفحة
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addToast, onNewOrder]);

  return {
    socket: socketRef.current,
  };
}
