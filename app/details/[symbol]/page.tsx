import { Asset, fetchAssets } from "@/lib/data/assets";
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
import { formatNumber, formatPercent, prettifyNumber } from "@/lib/utils/numbers";
import { getPriceMovementTextColorClass } from "@/lib/utils/ui-helpers";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface SymbolDetailsPageProps {
  params: Promise<{ symbol: string }>;
}

async function getAssetBySymbol(symbol: string): Promise<Asset | null> {
  try {
    const assets = await fetchAssets();
    return assets.find(
      (asset) => asset.symbol.toLowerCase() === symbol.toLowerCase()
    ) || null;
  } catch (error) {
    console.error(`Error fetching asset for symbol "${symbol}":`, error);
    return null;
  }
}

export default async function SymbolDetailsPage({ params }: SymbolDetailsPageProps) {
  const { symbol } = await params;
  const asset = await getAssetBySymbol(symbol);

  if (!asset) {
    notFound();
  }

  const textColorClass = getPriceMovementTextColorClass(asset.changePercent24Hr, 700);
  const glowClass = "text-shadow-[0_0_20px_var(--tw-glow-color)]";

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-12 pb-8 pt-24">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="glassmorphic">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <CryptoIcon symbol={asset.symbol} size={48} name={asset.name} />
              <div>
                <CardTitle className="text-3xl font-bold">{asset.name}</CardTitle>
                <CardDescription className="text-lg">{asset.symbol}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Rank</div>
              <div className="text-2xl font-bold">#{asset.rank}</div>
            </div>
          </CardHeader>
        </Card>

        {/* Price Section */}
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Price Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between ${textColorClass}`}>
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
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-xl font-semibold">
                  ${prettifyNumber(asset.marketCapUsd)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="text-xl font-semibold">
                  ${prettifyNumber(asset.volumeUsd24Hr)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">VWAP (24h)</div>
                <div className="text-xl font-semibold">
                  ${formatNumber(asset.vwap24Hr)}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Circulating Supply</div>
                <div className="text-xl font-semibold">
                  {prettifyNumber(asset.supply)} {asset.symbol}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Max Supply</div>
                <div className="text-xl font-semibold">
                  {asset.maxSupply ? `${prettifyNumber(asset.maxSupply)} ${asset.symbol}` : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Explorer</div>
                <div className="text-xl font-semibold">
                  <a 
                    href={asset.explorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>
              Get AI-powered insights and analysis for {asset.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full md:w-auto"
              variant="default"
              size="lg"
            >
              Generate AI Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}