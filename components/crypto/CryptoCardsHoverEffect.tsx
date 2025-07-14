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
        const glowColor = isPositive
          ? "rgba(0, 255, 0, 0.6)"
          : "rgba(255, 0, 0, 0.6)";

        // Ensure perspective so the rotation has depth
        gsap.set(el, { transformPerspective: 800 });

        const onEnter = () => {
          gsap.to(el, {
            rotateX: -6,
            boxShadow: `0px 0px 20px ${glowColor}`,
            duration: 0.3,
            ease: "power2.out",
          });
        };

        const onLeave = () => {
          gsap.to(el, {
            rotateX: 0,
            boxShadow: "0px 0px 0px rgba(0,0,0,0)",
            duration: 0.25,
            ease: "power2.out",
          });
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