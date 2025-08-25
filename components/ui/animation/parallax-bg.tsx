"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { memo, useEffect, useState } from "react";

function ParallaxBgInner() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const { scrollY } = useScroll();

  // ✅ Background moves at 30% of scroll speed
  const bgY = useTransform(scrollY, (v) => v * -0.7);
  const bgPos = useTransform(bgY, (v) => `center ${v}px`);

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url("/moon-bg.jpg")',
        backgroundRepeat: "repeat",
        backgroundSize: "1536px 1024px", // tile size
        backgroundPosition: bgPos,
        pointerEvents: "none",
        willChange: "background-position",
        opacity: 0.8,
      }}
    />
  );
}

export default memo(ParallaxBgInner);
