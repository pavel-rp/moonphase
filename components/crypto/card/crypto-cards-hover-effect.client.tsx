"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Adds a 3D tilt + colored glow hover effect to elements that have the
 * `crypto-card` class. The glow color is determined by the
 * `data-change-positive` attribute that is rendered on each card from the server.
 *
 * ⚠️  This component renders nothing. It only runs a client-side effect that
 * progressively enhances already-rendered server components, keeping RSC
 * benefits intact while still delivering rich interactions in the browser.
 */
export default function CryptoCardsHoverEffect() {
  const isMounted = useRef(false);

  useEffect(() => {
    // Ensure we only run after hydration is complete
    if (isMounted.current) return;
    isMounted.current = true;

    const listeners: Array<{
      el: HTMLElement;
      enter: EventListenerOrEventListenerObject;
      leave: EventListenerOrEventListenerObject;
    }> = [];

    // Use a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll<HTMLElement>(".crypto-card");

      cards.forEach((el) => {
        // Determine the glow color based on the 24h change sign
        const isPositive = el.dataset.changePositive === "true";
        // Slightly stronger colored glow for glass effect
        const glowColor = isPositive
          ? "rgba(0, 255, 0, 0.45)"
          : "rgba(255, 0, 0, 0.45)";
        const defaultBorderColor = "rgba(255,255,255,0.3)";

        // Track if perspective has been set
        let perspectiveSet = false;

        const onEnter = () => {
          // Kill any existing animations
          gsap.killTweensOf(el);

          // Set perspective only on first hover to avoid hydration issues
          if (!perspectiveSet) {
            gsap.set(el, { transformPerspective: 800 });
            perspectiveSet = true;
          }

          // Create a timeline for the bounce then settle animation.
          const tl = gsap.timeline();

          tl.to(el, {
              rotateX: 14,
              borderColor: glowColor,
              duration: 0.18,
              ease: "power2.inOut",
            })
            .to(el, {
              rotateX: -10,
              borderColor: glowColor,
              duration: 0.16,
              ease: "power2.inOut",
            })
            .to(el, {
              rotateX: 6,
              borderColor: glowColor,
              duration: 0.1,
              ease: "power2.inOut",
            })
            .to(el, {
              rotateX: -3,
              borderColor: glowColor,
              duration: 0.2,
              ease: "power2.out",
            })
            .to(el, {
              rotateX: 0,
              borderColor: glowColor,
              duration: 0.2,
              ease: "power2.out",
            });
        };

        const onLeave = () => {
          // Kill any existing animations
          gsap.killTweensOf(el);

          gsap.to(el, {
            rotateX: 0,
            //boxShadow: "none",
            borderColor: defaultBorderColor,
            duration: 0.3,
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

        listeners.push({ el, enter: onEnter, leave: onLeave });
      });
    }, 100); // Small delay to ensure hydration is complete

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      listeners.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
        // Kill any remaining animations on cleanup
        gsap.killTweensOf(el);
      });
    };
  }, []);

  return null;
}