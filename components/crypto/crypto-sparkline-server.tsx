import { Suspense } from "react";
import LoadingSparkline from "./loading-sparkline";
import { Sparkline } from "../ui/sparkline";
import { fetchPrices } from "@/lib/data/prices";

async function CryptoSparklineLoader({ symbol }: { symbol: string }) {
  const data = await fetchPrices(symbol);

  const isAscending = data[0] < data[data.length - 1];
  const color = isAscending ? "text-green-700" : "text-red-700";

  return <Sparkline data={data} className={color} />;
}

export function CryptoSparklineServer({ symbol }: { symbol: string }) {
  return (
    <Suspense
      fallback={<LoadingSparkline opacity={0.5} className="animate-pulse" />}
    >
      <CryptoSparklineLoader symbol={symbol} />
    </Suspense>
  );
}