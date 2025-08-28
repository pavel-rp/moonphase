"use client";

import {
  AnimatePresence,
  motion,
  TargetAndTransition,
  Transition,
  VariantLabels,
} from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useEffect, useRef } from "react";

function scrollToTopInstant() {
  // Using a double rAF to ensure any pending layout/paint is flushed before scrolling
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
    });
  });
}

function usePreviousValue<T>(value: T): T | undefined {
  const prevValue = useRef<T | undefined>(undefined);

  useEffect(() => {
    prevValue.current = value;
    return () => {
      prevValue.current = undefined;
    };
  });

  return prevValue.current;
}

function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context) || null;

  const segment = useSelectedLayoutSegment();
  const prevSegment = usePreviousValue(segment);

  const changed =
    segment !== prevSegment &&
    segment !== undefined &&
    prevSegment !== undefined;

  return (
    <LayoutRouterContext.Provider value={changed ? prevContext : context}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
}

interface LayoutTransitionProps {
  children: React.ReactNode;
  className?: string;
  initial?: boolean | TargetAndTransition | VariantLabels;
  animate?: TargetAndTransition | VariantLabels;
  exit?: TargetAndTransition | VariantLabels;
  transition?: Transition;
}

export function LayoutTransition({
  children,
  className,
  initial = { scale: 0.96, filter: "blur(8px)" },
  animate = { scale: 1, filter: "blur(0px)" },
  exit = { scale: 0.96, filter: "blur(8px)" },
  transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}: LayoutTransitionProps) {
  const segment = useSelectedLayoutSegment();

  // When segment changes, scroll to top after the new content has mounted
  const prevSegmentRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevSegmentRef.current !== null && prevSegmentRef.current !== segment) {
      scrollToTopInstant();
    }
    prevSegmentRef.current = segment ?? null;
  }, [segment]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className={className}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
