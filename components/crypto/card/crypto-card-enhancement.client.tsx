"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CryptoCard, CryptoCardProps } from "./crypto-card";

/**
 * Client component that provides interactive enhancements to CryptoCard
 * Uses slots pattern to avoid importing children as client components
 */
export function CryptoCardWithEnhancement(props: CryptoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const card = cardRef.current;
    if (!card) return;

    // Determine the glow color based on the 24h change sign
    const isPositive = props.changePercent24Hr >= 0;
    const glowColor = isPositive
      ? "rgba(0, 255, 0, 0.45)"
      : "rgba(255, 0, 0, 0.45)";
    const defaultBorderColor = "rgba(255,255,255,0.3)";

    let perspectiveSet = false;

    const onEnter = () => {
      gsap.killTweensOf(card);

      if (!perspectiveSet) {
        gsap.set(card, { transformPerspective: 800 });
        perspectiveSet = true;
      }

      const tl = gsap.timeline();
      tl.to(card, {
          rotateX: 14,
          borderColor: glowColor,
          duration: 0.18,
          ease: "power2.inOut",
        })
        .to(card, {
          rotateX: -10,
          borderColor: glowColor,
          duration: 0.16,
          ease: "power2.inOut",
        })
        .to(card, {
          rotateX: 6,
          borderColor: glowColor,
          duration: 0.1,
          ease: "power2.inOut",
        })
        .to(card, {
          rotateX: -3,
          borderColor: glowColor,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(card, {
          rotateX: 0,
          borderColor: glowColor,
          duration: 0.2,
          ease: "power2.out",
        });
    };

    const onLeave = () => {
      gsap.killTweensOf(card);
      gsap.to(card, {
        rotateX: 0,
        borderColor: defaultBorderColor,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          card.style.boxShadow = "";
          card.style.borderColor = "";
        },
      });
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);

    return () => {
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(card);
    };
  }, [props.changePercent24Hr]);

  return <CryptoCard {...props} ref={cardRef} />;
}