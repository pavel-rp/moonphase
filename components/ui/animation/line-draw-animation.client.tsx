"use client";

import { cn } from "@/lib/utils/utils";
import { useGSAP } from "@gsap/react";
import { ComponentType, Ref, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

type LineDrawTargetProps = {
  className?: string;
  lineRef?: Ref<SVGPolylineElement>;
  containerRef?: Ref<HTMLDivElement>;
};

type PendingDraw = { line: SVGPolylineElement; draw: (length: number) => void };

// Lines mounted in the current commit, waiting to be measured.
let pendingDraws: PendingDraw[] = [];

/**
 * Measures `line` together with every other line mounted in the same commit,
 * then calls `draw` with its length. Reading every length before any line is
 * styled lets the browser recalculate styles once, not once per line.
 */
function measureThenDraw(line: SVGPolylineElement, draw: (length: number) => void) {
  if (pendingDraws.length === 0) {
    // Runs once the commit's layout effects are done, before the next paint.
    queueMicrotask(() => {
      // A line removed before it could be measured has nothing left to draw
      // (and can't be measured).
      const draws = pendingDraws.filter((pending) => pending.line.isConnected);
      pendingDraws = [];
      const lengths = draws.map((pending) => DrawSVGPlugin.getLength(pending.line));
      draws.forEach((pending, i) => pending.draw(lengths[i]));
    });
  }
  pendingDraws.push({ line, draw });
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

    // Runs once on mount. Depending on `classNames` re-ran it right after the
    // opacity flip above, restarting both tweens a tick into the animation.
    useGSAP(
      () => {
        // Only animates when the user has no reduced-motion preference. If the
        // setting changes, matchMedia reverts or replays the tweens, and
        // useGSAP's context reverts it on unmount.
        gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
          const line = lineRef.current;
          let lineTween: gsap.core.Tween | undefined;
          let reverted = false;

          if (line) {
            // A DrawSVG tween on a non-scaling stroke re-measures the line on
            // every frame, forcing a style recalc each time. The length can't
            // change mid-draw, so it's measured once, and the dash is written
            // the way DrawSVG writes it.
            measureThenDraw(line, (length) => {
              if (reverted) {
                return;
              }
              const progress = { dash: 0 };
              const setDash = () => {
                line.style.strokeDasharray = `${progress.dash}px,${length - progress.dash + 0.1}px`;
              };
              setDash();
              lineTween = gsap.to(progress, {
                dash: length,
                duration: 0.8,
                ease: "power2.out",
                onUpdate: setDash,
                // A resize changes a non-scaling stroke's length, so the
                // finished line can't keep a fixed dash.
                onComplete: () => {
                  line.style.removeProperty("stroke-dasharray");
                },
              });
            });
          }

          const container = containerRef.current;
          if (container) {
            // Written directly too: tweening the CSS property makes GSAP read
            // the computed opacity first, a style recalc per sparkline.
            const fade = { opacity: 0 };
            const setOpacity = () => {
              container.style.opacity = String(fade.opacity);
            };
            setOpacity();
            gsap.to(fade, { opacity: 1, duration: 0.4, ease: "power1.inOut", onUpdate: setOpacity });
          }

          // Runs after the context reverts its own tweens. The line tween
          // starts later, outside the context, so it's stopped here, and the
          // styles both tweens wrote are cleared.
          return () => {
            reverted = true;
            lineTween?.kill();
            line?.style.removeProperty("stroke-dasharray");
            container?.style.removeProperty("opacity");
          };
        });
      },
      { scope: containerRef, dependencies: [] }
    );

    // The wrapped component receives every prop it was given, with the
    // animated className and the refs the tweens target.
    const wrappedProps = { ...props, className: classNames, lineRef, containerRef } as P;

    return <WrappedComponent {...wrappedProps} />;
  };
}
