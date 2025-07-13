import { Suspense } from "react";
import { Sparkline } from "../ui/sparkline";
import { priceDataService } from "@/lib/services/price-data";
import React from "react"; // Added missing import
import LoadingSparkline from "./LoadingSparkline";

async function CryptoSparklineLoader({ symbol }: { symbol: string }) {
  try {
    const sparklineData = await priceDataService.getSparklineData(symbol, { period: '24h' });
    
    const isAscending = sparklineData.changePercent24h >= 0;
    const color = isAscending ? "text-green-700" : "text-red-700";

    return <Sparkline data={sparklineData.prices} className={color} />;
  } catch (error) {
    console.error(`Failed to load sparkline for ${symbol}:`, error);
    
    // Fallback to a simple error state or empty sparkline
    return <div className="h-8 w-full bg-gray-200 rounded opacity-50"></div>;
  }
}

export function CryptoSparkline({ symbol }: { symbol: string }) {
  return (
    <Suspense fallback={<LoadingSparkline opacity={0.5} className="animate-pulse" />}>
      <CryptoSparklineLoader symbol={symbol} />
    </Suspense>
  );
}
