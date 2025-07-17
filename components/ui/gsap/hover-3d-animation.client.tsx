"use client";

import { cn } from "@/lib/utils/utils";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface Hover3DAnimationProps {
  glowColor?: string;
  defaultBorderColor?: string;
  perspective?: number;
  bounceSequence?: Array<{
    rotateX: number;
    duration: number;
    ease: string;
  }>;
  onLeaveDuration?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withHover3DAnimation<T extends React.JSXElementConstructor<any>>(
  WrappedComponent: T
) {
  type Props = React.ComponentProps<T> & Hover3DAnimationProps;

  return function AnimatedComponent({
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    children: _children,
    glowColor,
    defaultBorderColor = "rgba(255,255,255,0.3)",
    perspective = 800,
    bounceSequence = [
      { rotateX: 14, duration: 0.18, ease: "power2.inOut" },
      { rotateX: -10, duration: 0.16, ease: "power2.inOut" },
      { rotateX: 6, duration: 0.1, ease: "power2.inOut" },
      { rotateX: -3, duration: 0.2, ease: "power2.out" },
      { rotateX: 0, duration: 0.2, ease: "power2.out" },
    ],
    onLeaveDuration = 0.3,
    ...props
  }: Props) {
    const elementRef = useRef<HTMLElement>(null);
    const [classNames, setClassNames] = useState(cn("hover-3d-animation", className));
    const perspectiveSet = useRef(false);

    useEffect(() => {
      setClassNames(cn("hover-3d-animation", className));
    }, [className]);

    useGSAP(
      () => {
        const el = elementRef.current;
        if (!el) return;

        // Set perspective on first interaction
        if (!perspectiveSet.current) {
          gsap.set(el, { transformPerspective: perspective });
          perspectiveSet.current = true;
        }

        const onEnter = () => {
          // Kill any existing animations
          gsap.killTweensOf(el);

          // Create timeline for bounce animation
          const tl = gsap.timeline();

          bounceSequence.forEach((step: { rotateX: number; duration: number; ease: string }) => {
            tl.to(el, {
              rotateX: step.rotateX,
              boxShadow: glowColor 
                ? `0 0 12px ${glowColor}, 0 0 24px rgba(255,255,255,0.25), 0 0 48px rgba(255,255,255,0.15)`
                : undefined,
              borderColor: glowColor,
              duration: step.duration,
              ease: step.ease,
            });
          });
        };

        const onLeave = () => {
          // Kill any existing animations
          gsap.killTweensOf(el);

          gsap.to(el, {
            rotateX: 0,
            boxShadow: "none",
            borderColor: defaultBorderColor,
            duration: onLeaveDuration,
            ease: "power2.out",
            onComplete: () => {
              // Ensure styles are completely reset
              el.style.boxShadow = "";
              el.style.borderColor = "";
            },
          });
        };

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        // Cleanup function
        return () => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
          gsap.killTweensOf(el);
        };
      },
      { scope: elementRef, dependencies: [glowColor, defaultBorderColor, perspective, bounceSequence, onLeaveDuration] }
    );

    return (
      <WrappedComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
        ref={elementRef}
        className={classNames}
      />
    );
  };
} 