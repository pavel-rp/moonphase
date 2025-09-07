import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketDataCard from '../market-data-card';

jest.mock('@/lib/data/marketData', () => ({
  fetchMarketData: jest.fn(async (symbol: string) => ({
    symbol: symbol.toUpperCase(),
    marketCapUsd: 2_300_000_000_000,
    circulatingSupply: 20_000_000,
    maxSupply: 21_000_000,
    vwap24hUsd: 112_197,
    dominancePercent: 52,
  })),
}));

describe('MarketDataCard', () => {
  it('renders market data bullet list with correct labels and values', async () => {
    const ui = await MarketDataCard({ symbol: 'btc' });
    render(ui);

    expect(screen.getByText('Market Data')).toBeInTheDocument();

    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('$2.3T')).toBeInTheDocument();

    expect(screen.getByText('Circulating')).toBeInTheDocument();
    expect(screen.getByText('20M BTC')).toBeInTheDocument();

    expect(screen.getByText('Max Supply')).toBeInTheDocument();
    expect(screen.getByText('21M BTC')).toBeInTheDocument();

    expect(screen.getByText('VWAP (24h)')).toBeInTheDocument();
    expect(screen.getByText('$112,197')).toBeInTheDocument();

    expect(screen.getByText('Dominance')).toBeInTheDocument();
    expect(screen.getByText('52%')).toBeInTheDocument();
  });

  it('renders N/A for max supply when null', async () => {
    const { fetchMarketData } = jest.requireMock('@/lib/data/marketData');
    fetchMarketData.mockResolvedValueOnce({
      symbol: 'ETH',
      marketCapUsd: 1_100_000_000_000,
      circulatingSupply: 120_000_000,
      maxSupply: null,
      vwap24hUsd: 3_600,
      dominancePercent: 17,
    });

    const ui = await MarketDataCard({ symbol: 'eth' });
    render(ui);

    expect(screen.getByText('Max Supply')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

