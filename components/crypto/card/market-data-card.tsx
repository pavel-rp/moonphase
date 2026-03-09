import { prettifyNumber, formatNumber } from '@/lib/utils/numbers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataItemGrid } from '@/components/ui/data-item-grid';
import { fetchMarketData } from '@/lib/data/marketData';
import { CircleDollarSign, Coins, LineChart, PieChart } from 'lucide-react';

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
    <Card className="glassmorphic min-w-[220px]">
      <CardHeader>
        <CardTitle>Market Data</CardTitle>
      </CardHeader>
      <CardContent>
        <DataItemGrid
          items={[
            { icon: CircleDollarSign, label: 'Market Cap', value: marketCap },
            { icon: Coins, label: 'Circulating', value: circulating },
            { icon: Coins, label: 'Max Supply', value: maxSupply },
            { icon: LineChart, label: 'VWAP (24h)', value: vwap },
            { icon: PieChart, label: 'Dominance', value: dominance },
          ]}
        />
      </CardContent>
    </Card>
  );
}

