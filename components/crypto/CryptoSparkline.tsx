import { Suspense } from "react";
import { Sparkline } from "../ui/sparkline";
import { generateRandomWalk } from "@/lib/utils/random-walk";
import React from "react"; // Added missing import
import LoadingSparkline from "./LoadingSparkline";

async function CryptoSparklineLoader({ symbol }: { symbol: string }) {
  const getData = new Promise<number[]>((resolve) => {
    setTimeout(() => {
      resolve(generateRandomWalk());
    }, Math.random() * 10000 + 1000);
  });

  // This will suspend if not ready
  const data = await getData;

  const isAscending = data[0] < data[data.length - 1];
  const color = isAscending ? "text-green-700" : "text-red-700";

  return <Sparkline data={data} className={color} />;
}

export function CryptoSparkline({ symbol }: { symbol: string }) {
  return (
    <Suspense fallback={<LoadingSparkline opacity={0.5} className="animate-pulse" />}>
      <CryptoSparklineLoader symbol={symbol} />
    </Suspense>
  );
}
