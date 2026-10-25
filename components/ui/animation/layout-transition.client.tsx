"use client";

import { AnimatePresence, motion, Transition } from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useState } from "react";
import { ScrollOnEnter, useRouteScrollRestoration } from "./route-scroll-restoration.client";

function usePreviousValue<T>(value: T): T | undefined {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T | undefined>();

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
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
  transition?: Transition;
}

export function LayoutTransition({
  children,
  className,
  transition = { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
}: LayoutTransitionProps) {
  const segment = useSelectedLayoutSegment();
  const onPageEnter = useRouteScrollRestoration();

  const variants = {
    enter: { x: "100%", opacity: 1 }, 
    center: { x: "0%", opacity: 1 },
    exit: { x: "-100%", opacity: 1 },
  } as const;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        minHeight: "100dvh",
        overflowX: "clip",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={segment}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          style={{
            position: "absolute",
            inset: 0,
            willChange: "transform",
          }}
        >
          {/* Places the entering page's scroll (top, or its saved offset on
              Back/Forward) once it's in the DOM and before it paints. It
              starts off-screen at x: 100%, so the jump is never seen. */}
          <ScrollOnEnter onEnter={onPageEnter} />
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
