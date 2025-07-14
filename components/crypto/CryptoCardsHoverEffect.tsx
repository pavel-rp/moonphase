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
      // Inject complex SVG filters once per page
      const ensureSVGFilters = () => {
        if (document.getElementById("svg-effects")) return;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("id", "svg-effects");
        svg.setAttribute(
          "style",
          "position:absolute;width:0;height:0;pointer-events:none;z-index:-1"
        );

        // Dynamic noise filter with animated turbulence
        const dynNoise = document.createElementNS(svgNS, "filter");
        dynNoise.setAttribute("id", "dynamic-noise");
        dynNoise.setAttribute("x", "-20%");
        dynNoise.setAttribute("y", "-20%");
        dynNoise.setAttribute("width", "140%");
        dynNoise.setAttribute("height", "140%");

        const feTurb = document.createElementNS(svgNS, "feTurbulence");
        feTurb.setAttribute("type", "fractalNoise");
        feTurb.setAttribute("baseFrequency", "0.8");
        feTurb.setAttribute("numOctaves", "3");
        feTurb.setAttribute("seed", "2");
        feTurb.setAttribute("result", "noise");

        // Animate baseFrequency for subtle movement
        const animateBF = document.createElementNS(svgNS, "animate");
        animateBF.setAttribute("attributeName", "baseFrequency");
        animateBF.setAttribute("dur", "8s");
        animateBF.setAttribute("values", "0.7;0.9;0.7");
        animateBF.setAttribute("repeatCount", "indefinite");
        feTurb.appendChild(animateBF);

        const feColor = document.createElementNS(svgNS, "feColorMatrix");
        feColor.setAttribute("type", "saturate");
        feColor.setAttribute("values", "0");
        feColor.setAttribute("in", "noise");

        const feBlendOverlay = document.createElementNS(svgNS, "feBlend");
        feBlendOverlay.setAttribute("in", "SourceGraphic");
        feBlendOverlay.setAttribute("in2", "noise");
        feBlendOverlay.setAttribute("mode", "overlay");

        dynNoise.appendChild(feTurb);
        dynNoise.appendChild(feColor);
        dynNoise.appendChild(feBlendOverlay);

        // Inner glow filter for glass edges
        const innerGlow = document.createElementNS(svgNS, "filter");
        innerGlow.setAttribute("id", "inner-glow");
        innerGlow.setAttribute("x", "-50%");
        innerGlow.setAttribute("y", "-50%");
        innerGlow.setAttribute("width", "200%");
        innerGlow.setAttribute("height", "200%");

        const igBlur = document.createElementNS(svgNS, "feGaussianBlur");
        igBlur.setAttribute("stdDeviation", "8");
        igBlur.setAttribute("result", "blur");

        const igComposite = document.createElementNS(svgNS, "feComposite");
        igComposite.setAttribute("in", "SourceGraphic");
        igComposite.setAttribute("in2", "blur");
        igComposite.setAttribute("operator", "out");
        igComposite.setAttribute("result", "inverse");

        const igFlood = document.createElementNS(svgNS, "feFlood");
        igFlood.setAttribute("flood-color", "white");
        igFlood.setAttribute("flood-opacity", "0.2");

        const igComposite2 = document.createElementNS(svgNS, "feComposite");
        igComposite2.setAttribute("in2", "inverse");
        igComposite2.setAttribute("operator", "in");
        igComposite2.setAttribute("result", "innerGlow");

        const igBlend = document.createElementNS(svgNS, "feBlend");
        igBlend.setAttribute("in", "SourceGraphic");
        igBlend.setAttribute("in2", "innerGlow");
        igBlend.setAttribute("mode", "normal");

        innerGlow.appendChild(igBlur);
        innerGlow.appendChild(igComposite);
        innerGlow.appendChild(igFlood);
        innerGlow.appendChild(igComposite2);
        innerGlow.appendChild(igBlend);

        svg.appendChild(dynNoise);
        svg.appendChild(innerGlow);
        document.body.appendChild(svg);
      };

      ensureSVGFilters();

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

        const defaultPriceFilter = "url(#dynamic-noise) drop-shadow(0 0 0px transparent)";

        const hoverPriceFilter = (color: string) =>
          `url(#dynamic-noise) drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}) drop-shadow(0 0 22px ${color})`;

        const priceEl = el.querySelector<HTMLElement>(".neon-price");
        if (priceEl) {
          priceEl.style.setProperty("--glow", glowColor);
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

          // Animate price neon glow in parallel
          if (priceEl) {
            priceEl.classList.add("flicker");
            tl.to(
              priceEl,
              {
                filter: hoverPriceFilter(glowColor),
                duration: 0.25,
                ease: "power2.out",
              },
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
            priceEl.classList.remove("flicker");
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