"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Asset } from "@/lib/data/assets";
import { CryptoIcon } from "../crypto-icon";
import { CryptoSparklineClient } from "../crypto-sparkline-client";
import { formatNumber, formatPercent } from "@/lib/utils/numbers";
import { getPriceMovementTextColorClass } from "@/lib/utils/ui-helpers";

export default function CryptoCardContent({
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
          <CardTitle>{name}</CardTitle>
          <CardDescription>{symbol}</CardDescription>
        </div>
        <CryptoIcon symbol={symbol} size={30} name={name} />
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4">
        <div
          className={`flex w-full items-center justify-between ${textColorClass}`}
        >
          <span className={`text-2xl font-bold ${glowClass}`}>
            ${formatNumber(priceUsd)}
          </span>
          <span className={`text-sm ${glowClass}`}>
            {formatPercent(changePercent24Hr)}
          </span>
        </div>
        <div className="w-full">
          <CryptoSparklineClient symbol={symbol} />
        </div>
      </CardContent>
    </div>
  );
}
