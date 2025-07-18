import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { formatNumber, formatPercent } from "@/lib/utils/numbers";
import { CryptoIcon } from "../crypto-icon";
import { Asset } from "@/lib/data/assets";
import { CryptoSparklineServer } from "../crypto-sparkline-server";
import { forwardRef } from "react";

export type CryptoCardProps = Asset & {
  // Slot for client-side enhancements
  clientEnhancement?: React.ReactNode;
};

export const CryptoCard = forwardRef<HTMLDivElement, CryptoCardProps>(
  function CryptoCard(
    {
      name,
      symbol,
      priceUsd,
      changePercent24Hr,
      clientEnhancement,
    },
    ref
  ) {
    const colorClass = changePercent24Hr >= 0 ? "text-green-700" : "text-red-700";
    const shadowClass = "text-shadow-[0_0_10px_rgb(255_255_255_/_0.5)]";
    
    return (
      <Card
        ref={ref}
        className="glassmorphic crypto-card"
        data-change-positive={changePercent24Hr >= 0}
      >
        <CardHeader className="flex items-start justify-between">
          <div className="flex flex-col">
            <CardTitle>{name}</CardTitle>
            <CardDescription>{symbol}</CardDescription>
          </div>
          <CryptoIcon symbol={symbol} size={30} name={name} />
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <div
            className={`flex w-full items-center justify-between ${shadowClass} ${colorClass}`}
          >
            <span className={`text-2xl font-bold ${shadowClass} ${colorClass}`}>
              ${formatNumber(priceUsd)}
            </span>
            <span className="text-sm">{formatPercent(changePercent24Hr)}</span>
          </div>
          <CryptoSparklineServer symbol={symbol} />
        </CardContent>
        {/* Slot for client-side enhancements */}
        {clientEnhancement}
      </Card>
    );
  }
);