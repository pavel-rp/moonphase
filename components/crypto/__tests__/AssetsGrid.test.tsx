import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AssetsGrid from '../grid/AssetsGrid'
import { Asset } from '@/lib/data/assets'

// Mock the child components
jest.mock('../card/CryptoCard', () => ({
  CryptoCard: (props: Asset) => (
    <div data-testid="crypto-card" data-symbol={props.symbol}>
      {props.name} - {props.symbol}
    </div>
  ),
}))

jest.mock('../card/LoadingCard', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-card">Loading...</div>,
}))

jest.mock('@/components/ui/grid', () => ({
  Grid: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="grid" className={className}>
      {children}
    </div>
  ),
  GridItem: ({ 
    children, 
    span 
  }: { 
    children: React.ReactNode; 
    span?: number 
  }) => (
    <div data-testid="grid-item" data-span={span}>
      {children}
    </div>
  ),
}))

// Mock the fetchAssets function
jest.mock('@/lib/data/assets', () => ({
  fetchAssets: jest.fn(),
}))

import { fetchAssets } from '@/lib/data/assets'
const mockFetchAssets = fetchAssets as jest.MockedFunction<typeof fetchAssets>

const mockAssets: Asset[] = [
  {
    id: 'bitcoin',
    rank: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    supply: 19000000,
    maxSupply: 21000000,
    marketCapUsd: 800000000000,
    volumeUsd24Hr: 30000000000,
    priceUsd: 45000,
    changePercent24Hr: 5.25,
    vwap24Hr: 44500,
    explorer: 'https://blockchain.info/',
  },
  {
    id: 'ethereum',
    rank: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    supply: 120000000,
    maxSupply: null,
    marketCapUsd: 400000000000,
    volumeUsd24Hr: 15000000000,
    priceUsd: 3200,
    changePercent24Hr: 2.5,
    vwap24Hr: 3150,
    explorer: 'https://etherscan.io/',
  },
]

describe('AssetsGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle empty assets array', async () => {
    mockFetchAssets.mockResolvedValue([])

    const AssetsGridComponent = await AssetsGrid()
    render(AssetsGridComponent)

    // Should render grid but no cards
    expect(screen.getByTestId('grid')).toBeInTheDocument()
    expect(screen.queryByTestId('crypto-card')).not.toBeInTheDocument()
  })
})