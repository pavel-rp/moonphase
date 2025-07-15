'use client';

import { useEffect, useRef } from "react";

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

    let listeners: Array<{
      el: HTMLElement;
      enter: EventListenerOrEventListenerObject;
      leave: EventListenerOrEventListenerObject;
    }> = [];

    // Use a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      // Dynamically import GSAP to avoid it impacting the server bundle.
      import("gsap").then((mod) => {
        // GSAP can be the default export or a named export depending on bundler settings
        const gsap = (mod as any).gsap ?? (mod as any).default ?? mod;

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
              rotateX: -8,
              boxShadow: `0 0 12px ${glowColor}, 0 0 24px rgba(255,255,255,0.25), 0 0 48px rgba(255,255,255,0.15)`,
              borderColor: glowColor,
              duration: 0.18,
              ease: "power2.out",
            })
              .to(el, {
                rotateX: 6,
                borderColor: glowColor,
                duration: 0.18,
                ease: "power2.inOut",
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
              boxShadow: "none",
              borderColor: defaultBorderColor,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                // Ensure styles are completely reset
                el.style.boxShadow = "";
                el.style.borderColor = "";
              }
            });
          };

          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);

          listeners.push({ el, enter: onEnter, leave: onLeave });
        });
      });
    }, 100); // Small delay to ensure hydration is complete

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      listeners.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
        // Kill any remaining animations on cleanup
        import("gsap").then((mod) => {
          const gsap = (mod as any).gsap ?? (mod as any).default ?? mod;
          gsap.killTweensOf(el);
        });
      });
    };
  }, []);

  return null;
}