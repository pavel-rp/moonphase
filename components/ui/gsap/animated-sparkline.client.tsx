"use client";

import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { Sparkline, SparklineProps } from "../sparkline";
import { cn } from "@/lib/utils/utils";
import { useEffect } from "react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(DrawSVGPlugin);
gsap.registerPlugin(MotionPathPlugin);

export function AnimatedSparkline({ className, ...props }: SparklineProps) {
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

  return (
    <Sparkline
      className={classNames}
      lineRef={lineRef}
      containerRef={containerRef}
      {...props}
    />
  );
}
