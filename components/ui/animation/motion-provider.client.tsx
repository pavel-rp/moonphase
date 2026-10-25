"use client";

import { MotionConfig } from "motion/react";

/**
 * Applies the OS "reduce motion" setting to every Motion animation below it:
 * transform and layout animations (such as the route slide) are skipped, while
 * opacity fades still play.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
