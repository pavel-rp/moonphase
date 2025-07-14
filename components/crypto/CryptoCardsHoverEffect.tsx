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

        const feTurb1 = document.createElementNS(svgNS, "feTurbulence");
        feTurb1.setAttribute("type", "fractalNoise");
        feTurb1.setAttribute("baseFrequency", "0.6");
        feTurb1.setAttribute("numOctaves", "2");
        feTurb1.setAttribute("seed", "2");
        feTurb1.setAttribute("result", "noise1");

        const feTurb2 = document.createElementNS(svgNS, "feTurbulence");
        feTurb2.setAttribute("type", "turbulence");
        feTurb2.setAttribute("baseFrequency", "0.9");
        feTurb2.setAttribute("numOctaves", "4");
        feTurb2.setAttribute("seed", "8");
        feTurb2.setAttribute("result", "noise2");

        // Animate both
        const animateBF1 = document.createElementNS(svgNS, "animate");
        animateBF1.setAttribute("attributeName", "baseFrequency");
        animateBF1.setAttribute("dur", "10s");
        animateBF1.setAttribute("values", "0.4;0.8;0.4");
        animateBF1.setAttribute("repeatCount", "indefinite");
        feTurb1.appendChild(animateBF1);

        const animateBF2 = document.createElementNS(svgNS, "animate");
        animateBF2.setAttribute("attributeName", "baseFrequency");
        animateBF2.setAttribute("dur", "6s");
        animateBF2.setAttribute("values", "0.7;1;0.7");
        animateBF2.setAttribute("repeatCount", "indefinite");
        feTurb2.appendChild(animateBF2);

        const feColor = document.createElementNS(svgNS, "feColorMatrix");
        feColor.setAttribute("type", "saturate");
        feColor.setAttribute("values", "0");
        feColor.setAttribute("in", "noise1");

        // Blend noise1 and noise2
        const feBlendNoise = document.createElementNS(svgNS, "feBlend");
        feBlendNoise.setAttribute("in", "noise1");
        feBlendNoise.setAttribute("in2", "noise2");
        feBlendNoise.setAttribute("mode", "multiply");
        feBlendNoise.setAttribute("result", "noise");

        const feBlendOverlay = document.createElementNS(svgNS, "feBlend");
        feBlendOverlay.setAttribute("in", "SourceGraphic");
        feBlendOverlay.setAttribute("in2", "noise");
        feBlendOverlay.setAttribute("mode", "overlay");

        dynNoise.appendChild(feTurb1);
        dynNoise.appendChild(feTurb2);
        dynNoise.appendChild(feBlendNoise);
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

        // Chromatic aberration filter
        const chromAb = document.createElementNS(svgNS, "filter");
        chromAb.setAttribute("id", "chrom-ab");
        chromAb.setAttribute("color-interpolation-filters", "sRGB");

        const caRed = document.createElementNS(svgNS, "feOffset");
        caRed.setAttribute("dx", "1");
        caRed.setAttribute("dy", "0");
        caRed.setAttribute("in", "SourceGraphic");
        caRed.setAttribute("result", "redShift");

        const caRedColor = document.createElementNS(svgNS, "feColorMatrix");
        caRedColor.setAttribute("in", "redShift");
        caRedColor.setAttribute("type", "matrix");
        caRedColor.setAttribute("values", "1 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0");

        const caGreen = document.createElementNS(svgNS, "feOffset");
        caGreen.setAttribute("dx", "-1");
        caGreen.setAttribute("dy", "0");
        caGreen.setAttribute("in", "SourceGraphic");
        caGreen.setAttribute("result", "greenShift");

        const caGreenColor = document.createElementNS(svgNS, "feColorMatrix");
        caGreenColor.setAttribute("in", "greenShift");
        caGreenColor.setAttribute("type", "matrix");
        caGreenColor.setAttribute("values", "0 0 0 0 0   0 1 0 0 0   0 0 0 0 0   0 0 0 1 0");

        // Blue channel shift
        const caBlue = document.createElementNS(svgNS, "feOffset");
        caBlue.setAttribute("dx", "0");
        caBlue.setAttribute("dy", "1");
        caBlue.setAttribute("in", "SourceGraphic");
        caBlue.setAttribute("result", "blueShift");

        const caBlueColor = document.createElementNS(svgNS, "feColorMatrix");
        caBlueColor.setAttribute("in", "blueShift");
        caBlueColor.setAttribute("type", "matrix");
        caBlueColor.setAttribute("values", "0 0 0 0 0   0 0 0 0 0   0 0 1 0 0   0 0 0 1 0");

        const caMerge = document.createElementNS(svgNS, "feMerge");
        [caRedColor, caGreenColor, caBlueColor].forEach((node) => caMerge.appendChild(node));

        // Append blue shift elements
        chromAb.appendChild(caBlue);
        chromAb.appendChild(caBlueColor);
        chromAb.appendChild(caRed);
        chromAb.appendChild(caRedColor);
        chromAb.appendChild(caGreen);
        chromAb.appendChild(caGreenColor);
        chromAb.appendChild(caMerge);

        svg.appendChild(dynNoise);
        svg.appendChild(innerGlow);
        svg.appendChild(chromAb);
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

        gsap.set(el, { transformPerspective: 800, filter: "url(#inner-glow) url(#chrom-ab)" });

        const defaultPriceFilter = "url(#dynamic-noise) drop-shadow(0 0 0px transparent)";

        const hoverPriceFilter = (color: string) =>
          `url(#dynamic-noise) drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}) drop-shadow(0 0 22px ${color})`;

        const priceEl = el.querySelector<HTMLElement>(".neon-price");
        const holoEl = el.querySelector<HTMLElement>(".holo");
        if (holoEl) {
          gsap.set(holoEl, { scale: 0.8 });
        }
        let flickerRAF: number | null = null;
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

          // Animate price neon glow & hologram in parallel
          if (priceEl) {
            tl.to(
              priceEl,
              {
                filter: hoverPriceFilter(glowColor),
                duration: 0.25,
                ease: "power2.out",
              },
              0
            );

            // Perlin-like flicker using layered sine waves on each RAF
            const start = performance.now();
            const noise = (t:number)=>{
              return (Math.sin(t*0.001*3)+Math.sin(t*0.0017*5)+Math.sin(t*0.0023*11))/3;
            }
            const loop=()=>{
              const t=performance.now()-start;
              const brightness=1+0.3*noise(t);
              priceEl!.style.filter=`${hoverPriceFilter(glowColor)} brightness(${brightness})`;
              flickerRAF=requestAnimationFrame(loop);
            };
            loop();
          }

          if (holoEl) {
            tl.to(
              holoEl,
              { opacity: 0.85, scale: 1, duration: 0.3, ease: "power2.out" },
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
            if(flickerRAF!==null) cancelAnimationFrame(flickerRAF);
            gsap.killTweensOf(priceEl);
            gsap.to(priceEl, {
              filter: defaultPriceFilter,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                priceEl!.style.filter = defaultPriceFilter;
              }
            });
          }

          if (holoEl) {
            gsap.to(holoEl, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.out" });
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