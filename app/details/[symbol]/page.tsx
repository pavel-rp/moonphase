import { Asset, fetchAssets } from "@/lib/data/assets";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SymbolDetailAnimated from "@/components/crypto/detail/symbol-detail-animated";

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      {/* Back Navigation */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Assets
        </Link>
      </div>

      <SymbolDetailAnimated asset={asset} />
    </main>
  );
}