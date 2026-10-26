"use client";

import { cn } from "@/lib/utils/utils";
import { animate } from "motion/react";
import { ComponentType, Ref, useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Preserve the previous power2.out and power1.inOut curves, not Motion's defaults.
const drawEase = (p: number) => 1 - (1 - p) ** 3;
const fadeEase = (p: number) => (p < 0.5 ? 2 * p ** 2 : 1 - 2 * (1 - p) ** 2);

type LineDrawTargetProps = {
  className?: string;
  lineRef?: Ref<SVGPolylineElement>;
  containerRef?: Ref<HTMLDivElement>;
};

type PendingDraw = {
  line: SVGPolylineElement | null;
  isActive: () => boolean;
  draw: (length: number) => { update: (progress: number) => void; complete: () => void };
  cancel?: () => void;
};

// Lines mounted in the current commit, waiting to be measured.
let pendingDraws: PendingDraw[] = [];

function getLineLength(line: SVGPolylineElement): number {
  // A non-scaling stroke's dashes are screen-sized, while its points are in
  // viewBox units. Keep the transformed-axis measurement used by DrawSVG.
  const matrix = line.getAttribute("vector-effect") === "non-scaling-stroke"
    ? line.getScreenCTM()
    : null;
  const scaleX = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
  const scaleY = matrix ? Math.hypot(matrix.c, matrix.d) : 1;
  const points = line.points;
  let length = 0;
  for (let i = 1; i < points.numberOfItems; i++) {
    const previous = points.getItem(i - 1);
    const point = points.getItem(i);
    length += Math.hypot((point.x - previous.x) * scaleX, (point.y - previous.y) * scaleY);
  }
  return length;
}

/** Read every length before styling any line, so layout is only flushed once. */
function measureThenDraw(pending: PendingDraw) {
  if (pendingDraws.length === 0) {
    // Runs once the commit's layout effects are done, before the next paint.
    queueMicrotask(() => {
      const draws = pendingDraws.filter(({ line, isActive }) => (!line || line.isConnected) && isActive());
      pendingDraws = [];
      const lengths = draws.map(({ line }) => line ? getLineLength(line) : 0);
      const animations = new Map(draws.map((pending, i) => [pending, pending.draw(lengths[i])]));
      if (animations.size === 0) return;

      // The whole mount batch shares one clock, not one driver per card. The
      // fade completes halfway through it; both curves stay exactly aligned.
      const clock = animate(0, 1, {
        type: "tween",
        duration: 0.8,
        ease: "linear",
        onUpdate: (progress) => animations.forEach(({ update }) => update(progress)),
        onComplete: () => {
          animations.forEach(({ complete }) => complete());
          animations.clear();
        },
      });
      draws.forEach((pending) => {
        pending.cancel = () => {
          animations.delete(pending);
          if (animations.size === 0) clock.stop();
        };
      });
    });
  }
  pendingDraws.push(pending);
  return () => pending.cancel?.();
}

export function withLineDrawAnimation<P extends LineDrawTargetProps>(
  WrappedComponent: ComponentType<P>
) {
  return function AnimatedComponent(props: Omit<P, "lineRef" | "containerRef">) {
    const { className } = props;
    const lineRef = useRef<SVGPolylineElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [classNames, setClassNames] = useState(cn("opacity-0", className));

    useEffect(() => {
      setClassNames(cn("opacity-100", className));
    }, [className]);

    useIsomorphicLayoutEffect(() => {
      const media = window.matchMedia("(prefers-reduced-motion: no-preference)");
      let stop: (() => void) | undefined;

      const update = () => {
        stop?.();
        stop = undefined;
        if (!media.matches) return;

        const line = lineRef.current;
        const container = containerRef.current;
        let active = true;
        let cancelDraw: (() => void) | undefined;

        const start = (length: number) => {
          const updateFrame = (progress: number) => {
            if (!active) return;
            if (line) {
              const dash = length * drawEase(progress);
              line.style.strokeDasharray = `${dash}px,${length - dash + 0.1}px`;
            }
            if (container) {
              container.style.opacity = String(fadeEase(Math.min(1, progress * 2)));
            }
          };
          updateFrame(0);
          return {
            update: updateFrame,
            // A resize changes the screen length; don't leave a fixed dash.
            complete: () => {
              if (active) line?.style.removeProperty("stroke-dasharray");
            },
          };
        };

        if (container) container.style.opacity = "0";
        if (line || container) {
          cancelDraw = measureThenDraw({ line, isActive: () => active, draw: start });
        }

        stop = () => {
          active = false;
          cancelDraw?.();
          line?.style.removeProperty("stroke-dasharray");
          container?.style.removeProperty("opacity");
        };
      };

      update();
      media.addEventListener("change", update);
      return () => {
        media.removeEventListener("change", update);
        stop?.();
      };
    }, []);

    // The wrapped component receives every prop it was given, with the
    // animated className and the refs the tweens target.
    const wrappedProps = { ...props, className: classNames, lineRef, containerRef } as P;

    return <WrappedComponent {...wrappedProps} />;
  };
}
