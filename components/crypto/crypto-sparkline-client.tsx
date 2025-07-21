"use client";

import { useEffect, useState } from "react";
import LoadingSparkline from "./loading-sparkline";
import { AnimatedSparkline } from "../ui/animation/animated-sparkline.client";
import { fetchPrices } from "@/lib/data/prices";

interface CryptoSparklineClientProps {
  symbol: string;
}

export function CryptoSparklineClient({ symbol }: CryptoSparklineClientProps) {
  const [data, setData] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrices() {
      try {
        setLoading(true);
        setError(null);
        const prices = await fetchPrices(symbol);
        setData(prices);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load prices");
      } finally {
        setLoading(false);
      }
    }

    loadPrices();
  }, [symbol]);

  if (loading) {
    return <LoadingSparkline opacity={0.5} className="animate-pulse" />;
  }

  if (error || !data) {
    return <LoadingSparkline opacity={0.3} className="opacity-50" />;
  }

  const isAscending = data[0] < data[data.length - 1];
  const color = isAscending ? "text-green-700" : "text-red-700";

  return <AnimatedSparkline data={data} className={color} />;
}