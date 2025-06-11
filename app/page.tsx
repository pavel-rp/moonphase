import { CryptoCard } from "@/components/crypto/CryptoCard";
import { Grid, GridItem } from "@/components/ui/grid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid className="w-full max-w-7xl mx-auto">
        <GridItem span={2}>
          <CryptoCard
            name="Bitcoin"
            symbol="BTC"
            price={30000}
            priceChange24h={-2.5}
            marketCap={600000000000}
            volume24h={20000000000}
            circulatingSupply={19000000}
          ></CryptoCard>
        </GridItem>
        <GridItem span={1}>
          <CryptoCard
            name="Ethereum"
            symbol="ETH"
            price={2000}
            priceChange24h={1.5}
            marketCap={200000000000}
            volume24h={10000000000}
            circulatingSupply={120000000}
          ></CryptoCard>
        </GridItem>
        <GridItem span={1}>
          <CryptoCard
            name="Solana"
            symbol="SOL"
            price={50}
            priceChange24h={3.2}
            marketCap={15000000000}
            volume24h={500000000}
            circulatingSupply={300000000}
          ></CryptoCard>
        </GridItem>
        <GridItem span={1}>
          <CryptoCard
            name="Tether"
            symbol="USDT"
            price={1}
            priceChange24h={0.0}
            marketCap={68000000000}
            volume24h={30000000000}
            circulatingSupply={68000000000}
          ></CryptoCard>
        </GridItem>
        <GridItem span={2}>
          <CryptoCard
            name="Cardano"
            symbol="ADA"
            price={0.5}
            priceChange24h={-1.2}
            marketCap={17000000000}
            volume24h={800000000}
            circulatingSupply={34000000000}
          ></CryptoCard>
        </GridItem>
        <GridItem>
          <CryptoCard
            name="XRP"
            symbol="XRP"
            price={0.4}
            priceChange24h={0.5}
            marketCap={20000000000}
            volume24h={1000000000}
            circulatingSupply={50000000000}
          ></CryptoCard>
        </GridItem>
      </Grid>
    </main>
  );
}
