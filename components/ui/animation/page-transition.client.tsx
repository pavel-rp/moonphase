"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Shared layout ID generator for consistent animations
export function getSharedLayoutId(symbol: string, element: string) {
  return `${symbol}-${element}`;
}

// Animation variants for shared elements
export const sharedElementVariants = {
  card: {
    initial: { scale: 1, borderRadius: "12px" },
    exit: { scale: 0.95, borderRadius: "8px" },
    transition: { duration: 0.4, ease: "easeInOut" }
  },
  icon: {
    initial: { scale: 1 },
    exit: { scale: 1.1 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  price: {
    initial: { fontSize: "1.5rem" },
    exit: { fontSize: "2.5rem" },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  sparkline: {
    initial: { height: "60px" },
    exit: { height: "80px" },
    transition: { duration: 0.4, ease: "easeInOut" }
  }
};