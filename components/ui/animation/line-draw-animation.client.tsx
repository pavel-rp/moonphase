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
          if (lineRef.current) {
            gsap.fromTo(
              lineRef.current,
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: 0.8, ease: "power2.out" }
            );
          }

          if (containerRef.current) {
            gsap.fromTo(
              containerRef.current,
              { opacity: 0 },
              { opacity: 1, duration: 0.4, ease: "power1.inOut" }
            );
          }
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
