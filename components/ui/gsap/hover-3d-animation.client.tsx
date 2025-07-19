"use client";

import { cn } from "@/lib/utils/utils";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin); // Register plugin

interface Hover3DAnimationProps {
  glowColor?: string;
  defaultBorderColor?: string;
  perspective?: number;
  bounceSequence?: Array<{
    rotateX: number; // Degrees, not percentage
    duration: number;
    ease: string;
  }>;
  onLeaveDuration?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withHover3DAnimation<
  T extends React.JSXElementConstructor<any>
>(WrappedComponent: T, props: Hover3DAnimationProps) {
  type Props = React.ComponentProps<T> & Hover3DAnimationProps;

  return function AnimatedComponent({
    className,
    children,
    glowColor = props.glowColor,
    defaultBorderColor = props.defaultBorderColor || "rgba(255,255,255,0.3)",
    perspective = props.perspective || 800,
    bounceSequence = props.bounceSequence || [
      { rotateX: 180, duration: 0.4, ease: "power2.inOut" },
      { rotateX: -90, duration: 0.3, ease: "power2.inOut" },
      { rotateX: 45, duration: 0.2, ease: "power2.inOut" },
      { rotateX: 0, duration: 0.3, ease: "power2.out" },
    ],
    onLeaveDuration = props.onLeaveDuration || 0.3,
    ...restProps
  }: Props) {
    console.log(
      glowColor,
      defaultBorderColor,
      perspective,
      bounceSequence,
      onLeaveDuration
    );

    const elementRef = useRef<HTMLElement>(null);
    const [classNames, setClassNames] = useState(
      cn("hover-3d-animation", className)
    );

    const perspectiveSet = useRef(false);

    useEffect(() => {
      setClassNames(cn("hover-3d-animation", className));
    }, [className]);

    useGSAP(
      () => {
        const el = elementRef.current;
        if (!el) return;


        // Get the center of the card for rotation origin
        const cardCenterX = el.offsetWidth / 2;
        const cardCenterY = el.offsetHeight / 2;

        // Set perspective and 3D styles immediately
        gsap.set(el, {
          transformPerspective: perspective,
        });

        const onMove = (e: MouseEvent) => {
          const rotationX = ((e.offsetY - cardCenterY) / cardCenterY) * 20; // Adjust the multiplier for sensitivity
          const rotationY = ((cardCenterX - e.offsetX) / cardCenterX) * 20; // Adjust the multiplier for sensitivity

          gsap.to(el, {
            rotationX: rotationX,
            rotationY: rotationY,
            transformPerspective: 1000,
            transformOrigin: "center center",
            duration: 0.3, // Adjust animation duration
            ease: "power1.out", // Adjust easing function
          });
        };

        const onLeave = () => {
          el.removeEventListener("mousemove", onMove);

          // Kill any existing animations
          gsap.killTweensOf(el);

          gsap.to(el, {
            rotateX: 0,
            duration: onLeaveDuration,
            ease: "power2.out",
          });

          setClassNames(classNames.replace("shadow-glow", ""));
        };

        el.addEventListener("mouseleave", onLeave);
        el.addEventListener("mousemove", onMove);

        // Cleanup function
        return () => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
          gsap.killTweensOf(el);
        };
      },
      {
        scope: elementRef,
        dependencies: [
          glowColor,
          defaultBorderColor,
          perspective,
          bounceSequence,
          onLeaveDuration,
        ],
      }
    );

    return (
      <WrappedComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
        ref={elementRef}
        className={classNames}
      >
        {children}
      </WrappedComponent>
    );
  };
}
