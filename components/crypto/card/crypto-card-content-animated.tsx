"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Asset } from "@/lib/data/assets";
import { CryptoIcon } from "../crypto-icon";
import { CryptoSparkline } from "../crypto-sparkline";
import { formatNumber, formatPercent } from "@/lib/utils/numbers";
import { getPriceMovementTextColorClass } from "@/lib/utils/ui-helpers";
import { motion } from "motion/react";
import { getSharedLayoutId } from "@/components/ui/animation/page-transition.client";

export default function CryptoCardContentAnimated({
  name,
  symbol,
  priceUsd,
  changePercent24Hr,
}: Asset) {
  const glowClass = "text-shadow-[0_0_20px_var(--tw-glow-color)]";
  const textColorClass = getPriceMovementTextColorClass(changePercent24Hr, 700);

  return (
    <div className="transform-3d transform-gpu translate-z-4 flex flex-col gap-4">
      <CardHeader className="flex items-start justify-between">
        <div className="flex flex-col">
          <motion.div layoutId={getSharedLayoutId(symbol, "title")}>
            <CardTitle>{name}</CardTitle>
          </motion.div>
          <motion.div layoutId={getSharedLayoutId(symbol, "symbol")}>
            <CardDescription>{symbol}</CardDescription>
          </motion.div>
        </div>
        <motion.div 
          layoutId={getSharedLayoutId(symbol, "icon")}
          className="flex-shrink-0"
        >
          <CryptoIcon symbol={symbol} size={30} name={name} />
        </motion.div>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4">
        <div
          className={`flex w-full items-center justify-between ${textColorClass}`}
        >
          <motion.span 
            layoutId={getSharedLayoutId(symbol, "price")}
            className={`text-2xl font-bold ${glowClass}`}
          >
            ${formatNumber(priceUsd)}
          </motion.span>
          <motion.span 
            layoutId={getSharedLayoutId(symbol, "change")}
            className={`text-sm ${glowClass}`}
          >
            {formatPercent(changePercent24Hr)}
          </motion.span>
        </div>
        <motion.div 
          layoutId={getSharedLayoutId(symbol, "sparkline")}
          className="w-full"
        >
          <CryptoSparkline symbol={symbol} />
        </motion.div>
      </CardContent>
    </div>
  );
}