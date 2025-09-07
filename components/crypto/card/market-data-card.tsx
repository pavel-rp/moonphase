import { prettifyNumber, formatNumber } from '@/lib/utils/numbers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchMarketData } from '@/lib/data/marketData';

type MarketDataCardProps = {
  symbol: string;
};

export default async function MarketDataCard({ symbol }: MarketDataCardProps) {
  const md = await fetchMarketData(symbol);

  const marketCap = `$${prettifyNumber(md.marketCapUsd)}`;
  const circulating = `${prettifyNumber(md.circulatingSupply)} ${md.symbol}`;
  const maxSupply = md.maxSupply ? `${prettifyNumber(md.maxSupply)} ${md.symbol}` : 'N/A';
  const vwap = `$${formatNumber(md.vwap24hUsd)}`;
  const dominance = `${md.dominancePercent.toFixed(0)}%`;

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle>Market Data</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-3 text-sm md:text-base">
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Market Cap</span>
            <span className="font-semibold tabular-nums">{marketCap}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Circulating</span>
            <span className="font-semibold tabular-nums">{circulating}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Max Supply</span>
            <span className="font-semibold tabular-nums">{maxSupply}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">VWAP (24h)</span>
            <span className="font-semibold tabular-nums">{vwap}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Dominance</span>
            <span className="font-semibold tabular-nums">{dominance}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

