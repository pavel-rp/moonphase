import { Grid, GridItem } from "@/components/ui/grid";
import { Asset, fetchAssets } from "@/lib/data/assets";
import { Suspense } from "react";
import ShimmerGrid from "../../ui/shimmer-grid";
import CryptoCardContent from "../card/crypto-card-content";
import CryptoCardClickable from "../card/crypto-card-clickable";

export default function AssetsGrid() {
  return (
    <Suspense fallback={<ShimmerGrid size={15} />}>
      <AssetsGridContent />
    </Suspense>
  );
}

async function AssetsGridContent() {
  const assets = await fetchAssets();
  const isFeatured = (asset: Asset) => asset.symbol === "BTC";

  return (
    <Grid className="w-full max-w-7xl mx-auto">
      {assets.map((asset) => (
        <GridItem span={isFeatured(asset) ? 2 : 1} key={asset.id}>
          <CryptoCardClickable {...asset}>
            <CryptoCardContent {...asset} />
          </CryptoCardClickable>
        </GridItem>
      ))}
    </Grid>
  );
}