"use client";

import { useRouter } from "next/navigation";
import { HoverEffectCard } from "../../ui/animation/hover-effect-card.client";
import { Asset } from "@/lib/data/assets";
import { getPriceMovementColorVar } from "@/lib/utils/ui-helpers";
import { motion } from "motion/react";
import { getSharedLayoutId } from "@/components/ui/animation/page-transition.client";

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

  const handleCardClick = () => {
    router.push(`/details/${symbol.toLowerCase()}`);
  };

  return (
    <motion.div layoutId={getSharedLayoutId(symbol, "card")}>
      <HoverEffectCard
        glowColor={getPriceMovementColorVar(changePercent24Hr, 300)}
        onClick={handleCardClick}
      >
        {children}
      </HoverEffectCard>
    </motion.div>
  );
}