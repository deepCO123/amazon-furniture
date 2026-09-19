"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";

export default function ScrollProgress() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (!hydrated || pathname?.startsWith("/admin")) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-accent z-[60] origin-left"
    />
  );
}
