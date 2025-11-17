"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { HoverEffectCard } from "../../ui/animation/hover-effect-card.client";
import { LoadingRings } from "../../ui/animation/loading-rings.client";
import { getPriceMovementColorVar } from "@/lib/utils/ui-helpers";

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
  const isMountedRef = useRef(true);

  const glowColor = getPriceMovementColorVar(changePercent24Hr, 300);

  // Cleanup timeout on unmount to prevent memory leaks and race conditions
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCardClick = () => {
    // Clear any existing timeout to prevent memory leaks from rapid clicks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only show loading rings if navigation takes longer than 300ms
    timeoutRef.current = setTimeout(() => {
      // Guard against setState on unmounted component
      if (isMountedRef.current) {
        setShowLoadingRings(true);
      }
    }, 300);

    router.push(`/details/${symbol.toLowerCase()}`, { scroll: false });
  };

  return (
    <div className="relative">
      <HoverEffectCard glowColor={glowColor} onClick={handleCardClick}>
        {children}
      </HoverEffectCard>
      {showLoadingRings && <LoadingRings color={glowColor} />}
    </div>
  );
}