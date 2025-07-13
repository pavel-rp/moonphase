import { CryptoCard } from "@/components/crypto/CryptoCard";
import LoadingCard from "@/components/crypto/LoadingCard";
import { Grid, GridItem } from "@/components/ui/grid";
import { Asset, fetchAssets } from "@/lib/data/assets";

interface AssetsGridProps {
  loading?: boolean;
}

export default async function AssetsGrid({ loading = false }: AssetsGridProps) {
  const assets = loading
    ? Array.from({ length: 15 }, (_, i) => i)
    : await fetchAssets();

  const isFeatured = (asset: Asset | number) =>
    loading ? asset === 0 : (asset as Asset).symbol === "BTC";

  return (
    <Grid className="w-full max-w-7xl mx-auto">
      {assets.map((asset, index) => (
        <GridItem
          span={isFeatured(asset) ? 2 : 1}
          key={loading ? index : (asset as Asset).id}
        >
          {loading ? <LoadingCard /> : <CryptoCard {...(asset as Asset)} />}
        </GridItem>
      ))}
    </Grid>
  );
}
