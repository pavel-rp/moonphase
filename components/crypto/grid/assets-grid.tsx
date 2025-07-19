import { Grid, GridItem } from "@/components/ui/grid";
import { Asset, fetchAssets } from "@/lib/data/assets";
import { Suspense } from "react";
import ShimmerGrid from "./loading-grid";
import CryptoCardContent from "../card/crypto-card-content";
import { CryptoCard } from "../card/crypto-card";

export default function AssetsGrid() {
  return (
    <Suspense fallback={<ShimmerGrid size={15} />}>
      <AssetsGridContent />
    </Suspense>
  );
}

async function AssetsGridContent() {
  try {
    const assets = await fetchAssets();
    console.log("AssetsGridContent: received", assets.length, "assets");
    
    const isFeatured = (asset: Asset) => asset.symbol === "BTC";

    return (
      <Grid className="w-full max-w-7xl mx-auto">
        {assets.map((asset) => (
          <GridItem span={isFeatured(asset) ? 2 : 1} key={asset.id}>
            <CryptoCard {...asset}>
              <CryptoCardContent {...asset} />
            </CryptoCard>
          </GridItem>
        ))}
      </Grid>
    );
  } catch (error) {
    console.error("Error in AssetsGridContent:", error);
    return (
      <div className="w-full max-w-7xl mx-auto p-8 text-center">
        <p className="text-red-500">Error loading assets: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
