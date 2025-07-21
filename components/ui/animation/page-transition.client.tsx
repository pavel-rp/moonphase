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
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Shared layout ID generator for consistent animations
export function getSharedLayoutId(symbol: string, element: string) {
  return `asset-${symbol.toLowerCase()}-${element}`;
}

// Animation spring configuration for smooth transitions
export const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

// Enhanced animation variants
export const cardTransitionVariants = {
  initial: { 
    scale: 1, 
    borderRadius: 12,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
  },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const elementTransitionVariants = {
  icon: {
    small: { width: 30, height: 30 },
    large: { width: 48, height: 48 },
    transition: springConfig
  },
  title: {
    card: { fontSize: "1.125rem", fontWeight: 600 },
    page: { fontSize: "1.875rem", fontWeight: 700 },
    transition: springConfig
  },
  price: {
    card: { fontSize: "1.5rem", fontWeight: 700 },
    page: { fontSize: "2.5rem", fontWeight: 700 },
    transition: springConfig
  },
  change: {
    card: { fontSize: "0.875rem" },
    page: { fontSize: "1.25rem" },
    transition: springConfig
  }
};