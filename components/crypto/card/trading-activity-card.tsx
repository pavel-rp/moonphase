import { prettifyNumber } from '@/lib/utils/numbers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTradingActivity } from '@/lib/data/tradingActivity';
import { BarChart3, Droplet, PieChart, GitFork } from 'lucide-react';

type TradingActivityCardProps = {
  symbol: string;
};

// Server-rendered SVG donut chart with professional styling
function DonutChart({ exchanges }: { exchanges: { name: string; percentage: number }[] }) {
  const radius = 22;
  const strokeWidth = 6;
  const size = (radius + strokeWidth) * 2 + 4; // Extra padding for glow
  const circumference = 2 * Math.PI * radius;
  const id = Math.random().toString(36).substr(2, 9); // Simple ID for server rendering
  
  // Use chart color variables for better theming
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  let cumulativePercentage = 0;
  const paths = exchanges.map((exchange, index) => {
    const percentage = exchange.percentage / 100;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercentage * circumference;
    cumulativePercentage += percentage;
    
    return (
      <circle
        key={index}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={chartColors[index] || 'hsl(var(--muted-foreground))'}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="opacity-90 transition-opacity duration-300"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
          strokeLinecap: 'round'
        }}
      />
    );
  });

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} className="shrink-0">
          <defs>
            {/* Subtle glow effect */}
            <filter id={`glow-${id}`}>
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g filter={`url(#glow-${id})`}>
            {paths}
          </g>
        </svg>
        {/* Center dot for polish */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/20"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1 text-xs">
        {exchanges.map((exchange, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <div 
              className="w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-110 shadow-sm"
              style={{ backgroundColor: chartColors[index] || 'hsl(var(--muted-foreground))' }}
            />
            <span className="text-muted-foreground font-medium truncate max-w-16">
              {exchange.name}
            </span>
            <span className="text-foreground font-semibold ml-auto">
              {exchange.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Server-rendered SVG stacked bar chart with gradients and glow
function StackedBar({ cex, dex }: { cex: number; dex: number }) {
  const width = 100;
  const height = 16;
  const borderRadius = 8;
  const cexWidth = (cex / 100) * width;
  const dexWidth = (dex / 100) * width;
  const id = Math.random().toString(36).substr(2, 9);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg width={width} height={height} className="shrink-0">
          <defs>
            {/* CEX gradient */}
            <linearGradient id={`cex-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity="0.7" />
            </linearGradient>
            {/* DEX gradient */}
            <linearGradient id={`dex-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity="0.7" />
            </linearGradient>
            {/* Subtle shadow */}
            <filter id={`bar-shadow-${id}`}>
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="black" floodOpacity="0.15"/>
            </filter>
          </defs>
          
          {/* Background track */}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="hsl(var(--muted))"
            rx={borderRadius}
            className="opacity-30"
          />
          
          {/* CEX bar */}
          <rect
            x={0}
            y={0}
            width={cexWidth}
            height={height}
            fill={`url(#cex-gradient-${id})`}
            rx={borderRadius}
            filter={`url(#bar-shadow-${id})`}
            className="transition-all duration-300"
          />
          
          {/* DEX bar */}
          <rect
            x={cexWidth}
            y={0}
            width={dexWidth}
            height={height}
            fill={`url(#dex-gradient-${id})`}
            rx={borderRadius}
            filter={`url(#bar-shadow-${id})`}
            className="transition-all duration-300"
          />
          
          {/* Subtle highlight on top */}
          <rect
            x={0}
            y={0}
            width={width}
            height={2}
            fill="rgba(255,255,255,0.2)"
            rx={borderRadius}
          />
        </svg>
      </div>
      
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 group">
          <div 
            className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: 'hsl(var(--chart-1))' }}
          />
          <span className="text-muted-foreground font-medium">CEX</span>
          <span className="text-foreground font-semibold">{cex}%</span>
        </div>
        <div className="flex items-center gap-1.5 group">
          <div 
            className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: 'hsl(var(--chart-2))' }}
          />
          <span className="text-muted-foreground font-medium">DEX</span>
          <span className="text-foreground font-semibold">{dex}%</span>
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
        <div className="grid grid-cols-1 gap-5">
          {/* 24h Volume */}
          <div className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-chart-1 transition-colors duration-200" />
              <span className="text-sm text-muted-foreground font-medium">24h Volume</span>
            </div>
            <span className="text-base md:text-lg lg:text-xl font-bold tabular-nums text-right text-foreground group-hover:text-chart-1 transition-colors duration-200">
              {volume24h}
            </span>
          </div>

          {/* Liquidity Score */}
          <div className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <Droplet className="h-4 w-4 text-chart-4 transition-colors duration-200" />
              <span className="text-sm text-muted-foreground font-medium">Liquidity Score</span>
            </div>
            <div className="relative">
              <div className="rounded-full bg-gradient-to-r from-chart-3/20 to-chart-1/20 px-3 py-1 border border-chart-1/30 shadow-sm">
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {ta.liquidityScore}
                </span>
              </div>
              {/* Subtle glow for high scores */}
              {ta.liquidityScore > 80 && (
                <div className="absolute inset-0 rounded-full bg-chart-1/10 blur-sm -z-10"></div>
              )}
            </div>
          </div>

          {/* Top Exchanges */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <PieChart className="h-4 w-4 text-chart-2 transition-colors duration-200" />
              <span className="text-sm text-muted-foreground font-medium">Top Exchanges</span>
            </div>
            <div className="pl-7">
              <DonutChart exchanges={ta.topExchanges} />
            </div>
          </div>

          {/* CEX/DEX Split */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <GitFork className="h-4 w-4 text-chart-3 transition-colors duration-200" />
              <span className="text-sm text-muted-foreground font-medium">CEX/DEX Split</span>
            </div>
            <div className="pl-7">
              <StackedBar cex={ta.cexDexSplit.cex} dex={ta.cexDexSplit.dex} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}