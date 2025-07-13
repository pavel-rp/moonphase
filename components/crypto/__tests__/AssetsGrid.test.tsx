import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AssetsGrid from '../AssetsGrid'
import { Asset } from '@/lib/data/assets'

// Mock the child components
jest.mock('../CryptoCard', () => ({
  CryptoCard: (props: Asset) => (
    <div data-testid="crypto-card" data-symbol={props.symbol}>
      {props.name} - {props.symbol}
    </div>
  ),
}))

jest.mock('../LoadingCard', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-card">Loading...</div>,
}))

jest.mock('../../ui/grid', () => ({
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

  it('should render loading state when loading prop is true', async () => {
    const AssetsGridComponent = await AssetsGrid({ loading: true })
    render(AssetsGridComponent)

    // Should render 15 loading cards
    const loadingCards = screen.getAllByTestId('loading-card')
    expect(loadingCards).toHaveLength(15)

    // Should not call fetchAssets when loading
    expect(mockFetchAssets).not.toHaveBeenCalled()
  })

  it('should render assets when loading is false', async () => {
    mockFetchAssets.mockResolvedValue(mockAssets)

    const AssetsGridComponent = await AssetsGrid({ loading: false })
    render(AssetsGridComponent)

    // Should render crypto cards for each asset
    const cryptoCards = screen.getAllByTestId('crypto-card')
    expect(cryptoCards).toHaveLength(2)
    expect(screen.getByText('Bitcoin - BTC')).toBeInTheDocument()
    expect(screen.getByText('Ethereum - ETH')).toBeInTheDocument()

    // Should call fetchAssets
    expect(mockFetchAssets).toHaveBeenCalledTimes(1)
  })

  it('should render assets when loading prop is not provided (defaults to false)', async () => {
    mockFetchAssets.mockResolvedValue(mockAssets)

    const AssetsGridComponent = await AssetsGrid({})
    render(AssetsGridComponent)

    // Should render crypto cards
    expect(screen.getByText('Bitcoin - BTC')).toBeInTheDocument()
    expect(mockFetchAssets).toHaveBeenCalledTimes(1)
  })

  it('should render Grid with correct className', async () => {
    mockFetchAssets.mockResolvedValue([])

    const AssetsGridComponent = await AssetsGrid({})
    render(AssetsGridComponent)

    const grid = screen.getByTestId('grid')
    expect(grid).toHaveClass('w-full')
    expect(grid).toHaveClass('max-w-7xl')
    expect(grid).toHaveClass('mx-auto')
  })

  it('should make BTC featured (span 2) in loading state', async () => {
    const AssetsGridComponent = await AssetsGrid({ loading: true })
    render(AssetsGridComponent)

    const gridItems = screen.getAllByTestId('grid-item')
    
    // First item (index 0) should be featured
    expect(gridItems[0]).toHaveAttribute('data-span', '2')
    
    // Other items should have default span
    expect(gridItems[1]).toHaveAttribute('data-span', '1')
  })

  it('should make BTC featured (span 2) when BTC is in assets', async () => {
    mockFetchAssets.mockResolvedValue(mockAssets)

    const AssetsGridComponent = await AssetsGrid({})
    render(AssetsGridComponent)

    const gridItems = screen.getAllByTestId('grid-item')
    
    // BTC should be featured
    const btcItem = gridItems.find(item => 
      item.querySelector('[data-symbol="BTC"]')
    )
    expect(btcItem).toHaveAttribute('data-span', '2')
    
    // ETH should not be featured
    const ethItem = gridItems.find(item => 
      item.querySelector('[data-symbol="ETH"]')
    )
    expect(ethItem).toHaveAttribute('data-span', '1')
  })

  it('should handle empty assets array', async () => {
    mockFetchAssets.mockResolvedValue([])

    const AssetsGridComponent = await AssetsGrid({})
    render(AssetsGridComponent)

    // Should render grid but no cards
    expect(screen.getByTestId('grid')).toBeInTheDocument()
    expect(screen.queryByTestId('crypto-card')).not.toBeInTheDocument()
  })

  it('should use correct keys for grid items', async () => {
    mockFetchAssets.mockResolvedValue(mockAssets)

    const AssetsGridComponent = await AssetsGrid({})
    render(AssetsGridComponent)

    // In non-loading state, should use asset.id as key
    // This is harder to test directly, but we can verify the components render correctly
    expect(screen.getByText('Bitcoin - BTC')).toBeInTheDocument()
    expect(screen.getByText('Ethereum - ETH')).toBeInTheDocument()
  })

  it('should handle assets without BTC (no featured item)', async () => {
    const nonBtcAssets = mockAssets.filter(asset => asset.symbol !== 'BTC')
    mockFetchAssets.mockResolvedValue(nonBtcAssets)

    const AssetsGridComponent = await AssetsGrid({})
    render(AssetsGridComponent)

    const gridItems = screen.getAllByTestId('grid-item')
    
    // All items should have span 1 (no featured item)
    gridItems.forEach(item => {
      expect(item).toHaveAttribute('data-span', '1')
    })
  })
})