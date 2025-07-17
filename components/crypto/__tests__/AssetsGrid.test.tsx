import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AssetsGrid from '../grid/assets-grid'
import { Asset } from '@/lib/data/assets'

// Mock the child components
jest.mock('../card/crypto-card', () => ({
  CryptoCard: (props: Asset) => (
    <div data-testid="crypto-card" data-symbol={props.symbol}>
      {props.name} - {props.symbol}
    </div>
  ),
}))

jest.mock('../card/loading-card', () => ({
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