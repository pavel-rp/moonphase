import { prettifyNumber, formatNumber } from '@/lib/utils/numbers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const dataItems = [
    {
      icon: CircleDollarSign,
      label: 'Market Cap',
      value: marketCap,
    },
    {
      icon: Coins,
      label: 'Circulating',
      value: circulating,
    },
    {
      icon: Coins,
      label: 'Max Supply',
      value: maxSupply,
    },
    {
      icon: LineChart,
      label: 'VWAP (24h)',
      value: vwap,
    },
    {
      icon: PieChart,
      label: 'Dominance',
      value: dominance,
    },
  ];

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle>Market Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-muted/50 p-2">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-base md:text-lg lg:text-xl font-semibold tabular-nums text-right">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

