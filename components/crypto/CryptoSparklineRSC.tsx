import { Suspense } from "react";
import { Sparkline } from "../ui/sparkline";
import { getSparklineDataRSC } from "@/lib/services/price-data-rsc";
import React from "react";
import LoadingSparkline from "./LoadingSparkline";

async function CryptoSparklineLoaderRSC({ symbol }: { symbol: string }) {
  const sparklineData = await getSparklineDataRSC(symbol, { period: '24h' });
  
  if (!sparklineData) {
    // Fallback to error state when data is unavailable
    return (
      <div className="h-8 w-full bg-gray-200 rounded opacity-50 flex items-center justify-center">
        <span className="text-xs text-gray-500">No data</span>
      </div>
    );
  }
  
  const isAscending = sparklineData.changePercent24h >= 0;
  const color = isAscending ? "text-green-700" : "text-red-700";

  return <Sparkline data={sparklineData.prices} className={color} />;
}

export function CryptoSparklineRSC({ symbol }: { symbol: string }) {
  return (
    <Suspense fallback={<LoadingSparkline opacity={0.5} className="animate-pulse" />}>
      <CryptoSparklineLoaderRSC symbol={symbol} />
    </Suspense>
  );
}

// Export both for backward compatibility
export { CryptoSparklineRSC as CryptoSparkline };