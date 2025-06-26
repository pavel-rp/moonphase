import { CryptoCard } from "@/components/crypto/CryptoCard";
import { Grid, GridItem } from "@/components/ui/grid";
import { Asset, fetchAssets } from "@/lib/data/assets";

export default async function Home() {
  const assets = await fetchAssets();
  console.log(assets);
  const isFeatured = (asset: Asset) => asset.symbol === "BTC";

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid className="w-full max-w-7xl mx-auto">
        {assets.map((asset) => (
          <GridItem span={isFeatured(asset) ? 2 : 1} key={asset.id}>
            <CryptoCard {...asset} />
          </GridItem>
        ))}
      </Grid>
    </main>
  );
}
