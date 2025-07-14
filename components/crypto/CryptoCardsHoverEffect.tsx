'use client';

import { useEffect } from "react";

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
  useEffect(() => {
    let listeners: Array<{
      el: HTMLElement;
      enter: EventListenerOrEventListenerObject;
      leave: EventListenerOrEventListenerObject;
    }> = [];

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

        // Ensure perspective so the rotation has depth
        gsap.set(el, { transformPerspective: 800 });

        const defaultPriceShadow = (color: string) =>
          `0 0 4px ${color}, 0 0 6px ${color}, 0 0 10px ${color}`;

        const hoverPriceShadow = (color: string) =>
          `0 0 6px ${color}, 0 0 12px ${color}, 0 0 22px ${color}, 0 0 32px ${color}`;

        const onEnter = () => {
          // Create a timeline for the bounce then settle animation.
          const tl = gsap.timeline();

          const priceEl = el.querySelector<HTMLElement>(".neon-price");
          
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

            // Animate price neon glow in parallel (start at same time as first tween)
          if (priceEl) {
            tl.to(
              priceEl,
              { textShadow: hoverPriceShadow(glowColor), duration: 0.25, ease: "power2.out" },
              0
            );
          }
        };

        const onLeave = () => {
          const priceEl = el.querySelector<HTMLElement>(".neon-price");
          gsap.to(el, {
            rotateX: 0,
            boxShadow: "0 0 0px rgba(0,0,0,0)",
            borderColor: defaultBorderColor,
            duration: 0.3,
            ease: "power2.out",
          });

          if (priceEl) {
            gsap.to(priceEl, {
              textShadow: defaultPriceShadow(glowColor),
              duration: 0.3,
              ease: "power2.out",
            });
          }
        };

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        listeners.push({ el, enter: onEnter, leave: onLeave });
      });
    });

    // Cleanup on unmount
    return () => {
      listeners.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return null;
}