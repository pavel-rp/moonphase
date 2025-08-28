"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { memo } from "react";

function ParallaxBgInner() {
  const reduce = useReducedMotion();

  const { scrollY } = useScroll();

  const bgY = useTransform(scrollY, (v) => v * -0.7);
  const bgPos = useTransform(bgY, (v) => `center ${v}px`);

  const segment = useSelectedLayoutSegment();

  if (reduce) {
    return null;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
          willChange: "opacity, background-position",
        }}
      />
    </AnimatePresence>
  );
}

export default memo(ParallaxBgInner);
