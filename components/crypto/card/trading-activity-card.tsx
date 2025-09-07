import { prettifyNumber } from '@/lib/utils/numbers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTradingActivity } from '@/lib/data/tradingActivity';
import { BarChart3, Droplet, PieChart, GitFork } from 'lucide-react';

type TradingActivityCardProps = {
  symbol: string;
};

// Server-rendered SVG donut chart
function DonutChart({ exchanges }: { exchanges: { name: string; percentage: number }[] }) {
  const radius = 20;
  const strokeWidth = 8;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;
  const paths = exchanges.map((exchange, index) => {
    const percentage = exchange.percentage / 100;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercentage * circumference;
    cumulativePercentage += percentage;
    
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b']; // blue, purple, amber
    
    return (
      <circle
        key={index}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors[index] || '#6b7280'}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="opacity-80"
      />
    );
  });

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} className="shrink-0">
        {paths}
      </svg>
      <div className="grid grid-cols-1 gap-0.5 text-xs text-muted-foreground">
        {exchanges.map((exchange, index) => {
          const colors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
          return (
            <div key={index} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${colors[index] || 'bg-gray-500'} opacity-80`} />
              <span className="truncate max-w-16">{exchange.name}</span>
              <span>{exchange.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Server-rendered SVG stacked bar chart
function StackedBar({ cex, dex }: { cex: number; dex: number }) {
  const width = 80;
  const height = 12;
  const cexWidth = (cex / 100) * width;
  const dexWidth = (dex / 100) * width;

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="shrink-0">
        <rect
          x={0}
          y={0}
          width={cexWidth}
          height={height}
          fill="#3b82f6"
          className="opacity-80"
          rx={2}
        />
        <rect
          x={cexWidth}
          y={0}
          width={dexWidth}
          height={height}
          fill="#8b5cf6"
          className="opacity-80"
          rx={2}
        />
      </svg>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 opacity-80" />
          <span>{cex}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500 opacity-80" />
          <span>{dex}%</span>
        </div>
      </div>
    </div>
  );
}

export default async function TradingActivityCard({ symbol }: TradingActivityCardProps) {
  const ta = await fetchTradingActivity(symbol);

  const volume24h = `$${prettifyNumber(ta.volume24hUsd)}`;

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle>Trading Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 24h Volume */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">24h Volume</span>
            </div>
            <span className="text-base md:text-lg lg:text-xl font-semibold tabular-nums text-right">
              {volume24h}
            </span>
          </div>

          {/* Liquidity Score */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Droplet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Liquidity Score</span>
            </div>
            <div className="rounded-md bg-muted/40 px-2 py-0.5 font-semibold text-sm">
              {ta.liquidityScore}
            </div>
          </div>

          {/* Top Exchanges */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Top Exchanges</span>
            </div>
            <DonutChart exchanges={ta.topExchanges} />
          </div>

          {/* CEX/DEX Split */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GitFork className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">CEX/DEX Split</span>
            </div>
            <StackedBar cex={ta.cexDexSplit.cex} dex={ta.cexDexSplit.dex} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}