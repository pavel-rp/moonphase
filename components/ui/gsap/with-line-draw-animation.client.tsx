"use client";

import { cn } from "@/lib/utils/utils";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

export function withLineDrawAnimation<T extends React.JSXElementConstructor<any>>(
  WrappedComponent: T
) {
  type Props = React.ComponentProps<T>;

  return function AnimatedComponent({ className, children, ...props }: Props) {
    const lineRef = useRef<SVGPolylineElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [classNames, setClassNames] = useState(cn("opacity-0", className));

    useEffect(() => {
      setClassNames(cn("opacity-100", className));
    }, [className]);

    useGSAP(
      () => {
        if (lineRef.current) {
          const tl = gsap.timeline();

          tl.fromTo(
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
      },
      { scope: lineRef, dependencies: [classNames] }
    );

    // spread ALL props, including className, data, etc., and pass refs as needed
    return (
      <WrappedComponent
        {...(props as any)}
        className={classNames}
        lineRef={lineRef}
        containerRef={containerRef}
      />
    );
  };
}
