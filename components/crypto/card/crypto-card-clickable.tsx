"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { HoverEffectCard } from "../../ui/animation/hover-effect-card.client";
import { LoadingRings } from "../../ui/animation/loading-rings.client";
import { getPriceMovementColorVar } from "@/lib/utils/ui-helpers";

interface CryptoCardClickableProps {
  symbol: string;
  changePercent24Hr: number | null;
  children: React.ReactNode;
}

export default function CryptoCardClickable({
  symbol,
  changePercent24Hr,
  children,
}: CryptoCardClickableProps) {
  const [showLoadingRings, setShowLoadingRings] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // One CSS variable colors both the card glow and the loading rings, including
  // the rings' drop-shadow filter.
  const glowColor = getPriceMovementColorVar(changePercent24Hr, 300);

  // The rings normally go away when navigation unmounts this card. If the page
  // stays instead (Back pressed mid-navigation, or a restore from the
  // back/forward cache), hide them so they don't loop forever.
  useEffect(() => {
    const hideRings = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowLoadingRings(false);
    };
    window.addEventListener("popstate", hideRings);
    window.addEventListener("pageshow", hideRings);

    return () => {
      window.removeEventListener("popstate", hideRings);
      window.removeEventListener("pageshow", hideRings);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Modified clicks open a new tab/window and leave this page in place, so
    // they shouldn't start the navigation spinner.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show loading rings after a brief delay (300ms) to avoid flashing on fast navigations
    timeoutRef.current = setTimeout(() => {
      setShowLoadingRings(true);
    }, 300);
  };

  // A real link (not a click handler on a div) so the card is reachable and
  // activatable by keyboard and screen readers, and supports open-in-new-tab.
  // Prefetch stays off to keep the home page from rendering every detail page.
  return (
    <div className="relative">
      <Link
        href={`/details/${symbol.toLowerCase()}`}
        scroll={false}
        prefetch={false}
        onClick={handleCardClick}
        className="block rounded-3xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <HoverEffectCard glowColor={glowColor}>{children}</HoverEffectCard>
      </Link>
      {showLoadingRings && <LoadingRings color={glowColor} />}
    </div>
  );
}