"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotionConfig,
  AnimatePresence,
} from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { memo } from "react";

// Tile size of the repeating moon image, and how fast it scrolls relative to the page.
const TILE_WIDTH = 1536;
const TILE_HEIGHT = 1024;
const PARALLAX_FACTOR = 0.7;

function ParallaxBgInner() {
  // Follows the root MotionConfig, like the route slide.
  const reduce = useReducedMotionConfig();

  const { scrollY } = useScroll();

  // The image repeats every TILE_HEIGHT px, so shifting it by the scroll offset
  // modulo one tile looks identical to shifting it by the full offset. That
  // keeps the parallax a composited translateY on a layer one tile taller than
  // the viewport, instead of repainting background-position on every frame.
  // The double modulo keeps the shift in [0, TILE_HEIGHT) during overscroll.
  const bgY = useTransform(scrollY, (v) => {
    const offset = (((v * PARALLAX_FACTOR) % TILE_HEIGHT) + TILE_HEIGHT) % TILE_HEIGHT;
    return -offset;
  });

  const segment = useSelectedLayoutSegment();

  return (
    <AnimatePresence initial={false}>
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
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* With reduced motion the background stays put instead of disappearing. */}
        <motion.div
          data-testid="parallax-layer"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `calc(100% + ${TILE_HEIGHT}px)`,
            backgroundImage: 'url("/moon-bg.jpg")',
            backgroundRepeat: "repeat",
            backgroundSize: `${TILE_WIDTH}px ${TILE_HEIGHT}px`,
            backgroundPosition: "center top",
            y: reduce ? 0 : bgY,
            // Unconditional: the server can't know the reduced-motion setting,
            // so a conditional value here would mismatch on hydration.
            willChange: "transform",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(ParallaxBgInner);
