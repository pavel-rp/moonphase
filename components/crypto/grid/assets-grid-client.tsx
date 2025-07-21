"use client";

import { Grid, GridItem } from "@/components/ui/grid";
import { Asset } from "@/lib/data/assets";
import CryptoCardContent from "../card/crypto-card-content";
import CryptoCardClickable from "../card/crypto-card-clickable";

interface AssetsGridClientProps {
  assets: Asset[];
}

export default function AssetsGridClient({ assets }: AssetsGridClientProps) {
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