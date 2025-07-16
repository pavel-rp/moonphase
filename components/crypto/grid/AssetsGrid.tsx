import { Grid, GridItem } from "@/components/ui/grid";
import { Asset, fetchAssets } from "@/lib/data/assets";
import { CryptoCard } from "../card/CryptoCard";
import { Suspense } from "react";
import ShimmerGrid from "./loading-grid";

export default async function AssetsGrid() {
  const assets = await fetchAssets();
  const isFeatured = (asset: Asset) => asset.symbol === "BTC";

  return (
    <Suspense fallback={<ShimmerGrid size={15} />}>
      <Grid className="w-full max-w-7xl mx-auto">
        {assets.map((asset) => (
          <GridItem span={isFeatured(asset) ? 2 : 1} key={asset.id}>
            <CryptoCard {...asset} />
          </GridItem>
        ))}
      </Grid>
    </Suspense>
  );
}
