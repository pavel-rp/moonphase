"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { HoverEffectCard } from "../../ui/animation/hover-effect-card.client";
import { LoadingRings } from "../../ui/animation/loading-rings.client";
import { getPriceMovementColorVar, getPriceMovementColorValue } from "@/lib/utils/ui-helpers";

interface CryptoCardClickableProps {
  symbol: string;
  changePercent24Hr: number;
  children: React.ReactNode;
}

export default function CryptoCardClickable({
  symbol,
  changePercent24Hr,
  children,
}: CryptoCardClickableProps) {
  const router = useRouter();
  const [showLoadingRings, setShowLoadingRings] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // CSS variable for HoverEffectCard glow (works in regular CSS)
  const glowColor = getPriceMovementColorVar(changePercent24Hr, 300);
  // Actual hex value for LoadingRings filter (CSS variables don't work in filters)
  const ringColor = getPriceMovementColorValue(changePercent24Hr, 300);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCardClick = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show loading rings after a brief delay (150ms) to avoid flashing on fast navigations
    timeoutRef.current = setTimeout(() => {
      setShowLoadingRings(true);
    }, 300);

    // Navigate to detail page
    router.push(`/details/${symbol.toLowerCase()}`, { scroll: false });
  };

  return (
    <div className="relative">
      <HoverEffectCard glowColor={glowColor} onClick={handleCardClick}>
        {children}
      </HoverEffectCard>
      {showLoadingRings && <LoadingRings color={ringColor} />}
    </div>
  );
}