import { Suspense } from "react";
import LoadingSparkline from "./loading-sparkline";
import { AnimatedSparkline } from "../ui/animation/animated-sparkline.client";
import { fetchPrices } from "@/lib/data/prices";

export async function CryptoSparklineLoader({ symbol }: { symbol: string }) {
  let data: number[];
  try {
    data = await fetchPrices(symbol);
  } catch (error) {
    // The sparkline is decorative: a failed price fetch (geo-block, delisted
    // pair, rate limit) must degrade only this chart, not the whole page.
    console.error(`Error loading sparkline for ${symbol}:`, error);
    return <LoadingSparkline />;
  }

  const isAscending = data[0] < data[data.length - 1];
  const color = isAscending ? "text-green-700" : "text-red-700";

  return <AnimatedSparkline data={data} className={color} />;
}

export function CryptoSparkline({ symbol }: { symbol: string }) {
  return (
    <Suspense
      fallback={<LoadingSparkline opacity={0.5} className="animate-pulse motion-reduce:animate-none" />}
    >
      <CryptoSparklineLoader symbol={symbol} />
    </Suspense>
  );
}