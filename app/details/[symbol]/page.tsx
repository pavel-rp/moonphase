import { Asset, fetchAssets } from "@/lib/data/assets";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CryptoIcon } from "@/components/crypto/crypto-icon";
import { CryptoSparkline } from "@/components/crypto/crypto-sparkline";
import { formatNumber, formatPercent } from "@/lib/utils/numbers";
import { getPriceMovementTextColorClass } from "@/lib/utils/ui-helpers";
import ShimmerCard from "@/components/ui/shimmer-card";
import MarketDataCard from "@/components/crypto/card/market-data-card";
import TradingActivityCard from "@/components/crypto/card/trading-activity-card";
import { ActionButton } from "@/components/ui/action-button";
import { BrainCircuit } from "lucide-react";

export const dynamic = "force-dynamic";

interface SymbolDetailsPageProps {
  params: Promise<{ symbol: string }>;
}

async function getAssetBySymbol(symbol: string): Promise<Asset | null> {
  try {
    const assets = await fetchAssets();
    return (
      assets.find(
        (asset) => asset.symbol.toLowerCase() === symbol.toLowerCase()
      ) || null
    );
  } catch (error) {
    console.error(`Error fetching asset for symbol "${symbol}":`, error);
    return null;
  }
}

export default async function SymbolDetailsPage({
  params,
}: SymbolDetailsPageProps) {
  const { symbol } = await params;
  const asset = await getAssetBySymbol(symbol);

  if (!asset) {
    notFound();
  }

  const textColorClass = getPriceMovementTextColorClass(
    asset.changePercent24Hr,
    700
  );
  const glowClass = "text-shadow-[0_0_20px_var(--tw-glow-color)]";

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-12 pb-8 pt-24">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="glassmorphic">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <CryptoIcon symbol={asset.symbol} size={48} name={asset.name} />
              <div>
                <CardTitle className="text-3xl font-bold">
                  {asset.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {asset.symbol}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Rank</div>
              <div className="text-2xl font-bold">#{asset.rank}</div>
            </div>
          </CardHeader>
        </Card>

        {/* Price & Market Data Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Price Section */}
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Price Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`flex items-center justify-between ${textColorClass}`}
              >
                <span className={`text-4xl font-bold ${glowClass}`}>
                  ${formatNumber(asset.priceUsd)}
                </span>
                <span className={`text-xl ${glowClass}`}>
                  {formatPercent(asset.changePercent24Hr)}
                </span>
              </div>
              <div className="w-full">
                <CryptoSparkline symbol={asset.symbol} />
              </div>
            </CardContent>
          </Card>

          {/* Market Data Section */}
          {/** Using mock MarketData via ports/adapters; server component by default */}
          <Suspense fallback={<ShimmerCard />}>
            <MarketDataCard symbol={asset.symbol} />
          </Suspense>

          {/* Trading Activity Section */}
          {/** Using mock TradingActivity via ports/adapters; server component by default */}
          <Suspense fallback={<ShimmerCard />}>
            <TradingActivityCard symbol={asset.symbol} />
          </Suspense>
        </div>

        {/* AI Analysis Section */}
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>
              Get AI-powered insights and analysis for {asset.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center gap-4">
              <ActionButton>
                Generate AI Analysis
                <BrainCircuit
                  className={
                    "size-5 group-hover:translate-x-1 rotate-180 " +
                    "group-hover:rotate-0 transition duration-300 ease-out " +
                    "group-active:translate-x-2 "
                  }
                />
              </ActionButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
