"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { memo } from "react";

function ParallaxBgInner() {
  const reduce = useReducedMotion();

  const { scrollY } = useScroll();

  const bgY = useTransform(scrollY, (v) => v * -0.7);
  const bgPos = useTransform(bgY, (v) => `center ${v}px`);

  if (reduce) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundImage: 'url("/moon-bg.jpg")',
        backgroundRepeat: "repeat",
        backgroundSize: "1536px 1024px",
        backgroundPosition: bgPos,
        pointerEvents: "none",
        willChange: "background-position",
        opacity: 0.8,
      }}
    />
  );
}

export default memo(ParallaxBgInner);
