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

        gsap.set(el, { transformPerspective: 800 });

        const defaultPriceFilter = "drop-shadow(0 0 0px transparent)";

        const hoverPriceFilter = (color: string) =>
          `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color}) drop-shadow(0 0 14px ${color})`;

        const priceEl = el.querySelector<HTMLElement>(".neon-price");
        if (priceEl) {
          gsap.set(priceEl, { filter: defaultPriceFilter });
        }

        const onEnter = () => {
          // Create a timeline for the bounce then settle animation.
          const tl = gsap.timeline();

          // priceEl already queried above
          
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
              { filter: hoverPriceFilter(glowColor), duration: 0.25, ease: "power2.out" },
              0
            );
          }
        };

        const onLeave = () => {
          gsap.to(el, {
            rotateX: 0,
            boxShadow: "0 0 0px rgba(0,0,0,0)",
            borderColor: defaultBorderColor,
            duration: 0.3,
            ease: "power2.out",
          });

          if (priceEl) {
            gsap.to(priceEl, {
              filter: defaultPriceFilter,
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