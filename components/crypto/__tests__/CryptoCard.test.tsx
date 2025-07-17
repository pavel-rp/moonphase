import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CryptoCard } from '../card/crypto-card'
import { Asset } from '@/lib/data/assets'

// Mock the CryptoIcon and CryptoSparkline components
jest.mock('@/components/crypto/crypto-icon', () => ({
  CryptoIcon: ({ symbol, name }: { symbol: string; name: string }) => (
    <div data-testid="crypto-icon">{symbol} - {name}</div>
  ),
}))

jest.mock('@/components/crypto/crypto-sparkline', () => ({
  CryptoSparkline: ({ symbol }: { symbol: string }) => (
    <div data-testid="crypto-sparkline">{symbol}</div>
  ),
}))

const mockAsset: Asset = {
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
}

describe('CryptoCard', () => {
  it('should render all basic information', () => {
    render(<CryptoCard {...mockAsset} />)

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('BTC', { selector: '[data-slot="card-description"]' })).toBeInTheDocument()
    expect(screen.getByText('$45,000')).toBeInTheDocument()
    expect(screen.getByText('5.25%')).toBeInTheDocument()
  })

  it('should render CryptoIcon with correct props', () => {
    render(<CryptoCard {...mockAsset} />)
    
    const icon = screen.getByTestId('crypto-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveTextContent('BTC - Bitcoin')
  })

  it('should render CryptoSparkline with correct symbol', () => {
    render(<CryptoCard {...mockAsset} />)
    
    const sparkline = screen.getByTestId('crypto-sparkline')
    expect(sparkline).toBeInTheDocument()
    expect(sparkline).toHaveTextContent('BTC')
  })

  it('should apply green color class for positive price change', () => {
    render(<CryptoCard {...mockAsset} />)

    const priceElement = screen.getByText('$45,000')
    expect(priceElement).toHaveClass('text-green-700')
  })

  it('should apply red color class for negative price change', () => {
    const negativeAsset = { ...mockAsset, changePercent24Hr: -3.45 }
    render(<CryptoCard {...negativeAsset} />)

    const priceElement = screen.getByText('$45,000')
    expect(priceElement).toHaveClass('text-red-700')
  })

  it('should handle zero price change', () => {
    const zeroChangeAsset = { ...mockAsset, changePercent24Hr: 0 }
    render(<CryptoCard {...zeroChangeAsset} />)

    const priceElement = screen.getByText('$45,000')
    expect(priceElement).toHaveClass('text-green-700')
  })

  it('should format price correctly', () => {
    const highPriceAsset = { ...mockAsset, priceUsd: 123456.789 }
    render(<CryptoCard {...highPriceAsset} />)

    expect(screen.getByText('$123,456.79')).toBeInTheDocument()
  })

  it('should format percentage correctly', () => {
    const preciseChangeAsset = { ...mockAsset, changePercent24Hr: 12.3456 }
    render(<CryptoCard {...preciseChangeAsset} />)

    expect(screen.getByText('12.35%')).toBeInTheDocument()
  })

  it('should have glassmorphic styling on card', () => {
    render(<CryptoCard {...mockAsset} />)
    
    const card = screen.getByText('Bitcoin').closest('[data-slot="card"]')
    expect(card).toHaveClass('glassmorphic')
  })

  it('should handle very large numbers', () => {
    const largeAsset = { ...mockAsset, priceUsd: 1000000 }
    render(<CryptoCard {...largeAsset} />)

    expect(screen.getByText('$1,000,000')).toBeInTheDocument()
  })
})