import { render, screen } from '@testing-library/react';
import { fetchTradingActivity } from '@/lib/data/tradingActivity';
import TradingActivityCard from '../trading-activity-card';

// Mock the fetchTradingActivity function
jest.mock('@/lib/data/tradingActivity');

const mockFetchTradingActivity = fetchTradingActivity as jest.MockedFunction<typeof fetchTradingActivity>;

// Mock data that matches the TradingActivity interface
const mockTradingActivity = {
  symbol: 'BTC',
  volume24hUsd: 22_000_000_000, // $22B
  liquidityScore: 95,
  topExchanges: [
    { name: 'Binance', percentage: 48 },
    { name: 'Coinbase', percentage: 28 },
    { name: 'Kraken', percentage: 24 },
  ],
  cexDexSplit: {
    cex: 85,
    dex: 15,
  },
};

describe('TradingActivityCard', () => {
  beforeEach(() => {
    mockFetchTradingActivity.mockResolvedValue(mockTradingActivity);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders trading activity data correctly', async () => {
    const component = await TradingActivityCard({ symbol: 'BTC' });
    render(component);

    // Check if the card header is rendered
    expect(screen.getByText('Trading Activity')).toBeInTheDocument();

    // Check if 24h Volume is rendered
    expect(screen.getByText('24h Volume')).toBeInTheDocument();
    expect(screen.getByText('$22B')).toBeInTheDocument();

    // Check if Liquidity Score is rendered
    expect(screen.getByText('Liquidity Score')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();

    // Check if Top Exchanges section is rendered
    expect(screen.getByText('Top Exchanges')).toBeInTheDocument();
    expect(screen.getByText('Binance')).toBeInTheDocument();
    expect(screen.getByText('Coinbase')).toBeInTheDocument();
    expect(screen.getByText('Kraken')).toBeInTheDocument();

    // Check if CEX/DEX Split section is rendered
    expect(screen.getByText('CEX/DEX Split')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('calls fetchTradingActivity with correct symbol', async () => {
    await TradingActivityCard({ symbol: 'ETH' });
    
    expect(mockFetchTradingActivity).toHaveBeenCalledWith('ETH');
    expect(mockFetchTradingActivity).toHaveBeenCalledTimes(1);
  });

  it('renders different exchange data correctly', async () => {
    const mockETHData = {
      ...mockTradingActivity,
      symbol: 'ETH',
      volume24hUsd: 18_500_000_000,
      liquidityScore: 87,
      topExchanges: [
        { name: 'Uniswap', percentage: 42 },
        { name: 'Binance', percentage: 35 },
        { name: 'Coinbase', percentage: 23 },
      ],
      cexDexSplit: {
        cex: 60,
        dex: 40,
      },
    };

    mockFetchTradingActivity.mockResolvedValueOnce(mockETHData);
    const component = await TradingActivityCard({ symbol: 'ETH' });
    render(component);

    expect(screen.getByText('$19B')).toBeInTheDocument(); // Should use prettifyNumber formatting 
    expect(screen.getByText('87')).toBeInTheDocument();
    expect(screen.getByText('Uniswap')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('renders SVG charts', async () => {
    const component = await TradingActivityCard({ symbol: 'BTC' });
    const { container } = render(component);

    // Check that SVG elements are present (donut chart and stacked bar)
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(6); // Icons (4) + donut chart (1) + stacked bar (1)
  });

  it('uses correct icons for each metric', async () => {
    const component = await TradingActivityCard({ symbol: 'BTC' });
    render(component);

    // The icons are rendered but not easily testable by their visual appearance
    // We can test that the content structure is correct by checking for the labels
    expect(screen.getByText('24h Volume')).toBeInTheDocument();
    expect(screen.getByText('Liquidity Score')).toBeInTheDocument();
    expect(screen.getByText('Top Exchanges')).toBeInTheDocument();
    expect(screen.getByText('CEX/DEX Split')).toBeInTheDocument();
  });
});