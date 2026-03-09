import React from 'react';
import { prettifyNumber } from '@/lib/utils/numbers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataItemGrid } from '@/components/ui/data-item-grid';
import { fetchTradingActivity } from '@/lib/data/tradingActivity';
import { BarChart3, Droplet, PieChart, GitFork } from 'lucide-react';

type TradingActivityCardProps = {
  symbol: string;
};

/** Chart color tokens from globals.css (chart-1 through chart-4) */
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-4)',
  'var(--chart-3)',
  'var(--chart-2)',
] as const;

// Server-rendered SVG donut chart
function DonutChart({ exchanges }: { exchanges: { name: string; percentage: number }[] }) {
  const radius = 20;
  const strokeWidth = 8;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;

  const paths = exchanges.reduce<{ cumulative: number; elements: React.JSX.Element[] }>(
    (acc, exchange, index) => {
      const percentage = exchange.percentage / 100;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -acc.cumulative * circumference;

      return {
        cumulative: acc.cumulative + percentage,
        elements: [
          ...acc.elements,
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={CHART_COLORS[index] ?? CHART_COLORS[CHART_COLORS.length - 1]}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="opacity-80"
          />
        ]
      };
    },
    { cumulative: 0, elements: [] }
  ).elements;

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} className="shrink-0">
        {paths}
      </svg>
      <div className="grid grid-cols-1 gap-0.5 text-xs text-muted-foreground">
        {exchanges.map((exchange, index) => (
          <div key={exchange.name} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full opacity-80"
              style={{ backgroundColor: CHART_COLORS[index] ?? CHART_COLORS[CHART_COLORS.length - 1] }}
            />
            <span className="truncate max-w-16">{exchange.name}</span>
            <span>{exchange.percentage}%</span>
          </div>
        ))}
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
          fill={CHART_COLORS[0]}
          className="opacity-80"
          rx={2}
        />
        <rect
          x={cexWidth}
          y={0}
          width={dexWidth}
          height={height}
          fill={CHART_COLORS[1]}
          className="opacity-80"
          rx={2}
        />
      </svg>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full opacity-80"
            style={{ backgroundColor: CHART_COLORS[0] }}
          />
          <span>{cex}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full opacity-80"
            style={{ backgroundColor: CHART_COLORS[1] }}
          />
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
    <Card className="glassmorphic min-w-[220px]">
      <CardHeader>
        <CardTitle>Trading Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <DataItemGrid
          items={[
            { icon: BarChart3, label: '24h Volume', value: volume24h },
            {
              icon: Droplet,
              label: 'Liquidity Score',
              value: (
                <div className="rounded-md bg-muted/40 px-2 py-0.5 font-semibold text-sm">
                  {ta.liquidityScore}
                </div>
              ),
            },
            {
              icon: PieChart,
              label: 'Top Exchanges',
              value: <DonutChart exchanges={ta.topExchanges} />,
            },
            {
              icon: GitFork,
              label: 'CEX/DEX Split',
              value: <StackedBar cex={ta.cexDexSplit.cex} dex={ta.cexDexSplit.dex} />,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
