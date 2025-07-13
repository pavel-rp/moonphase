import { render, screen } from '@testing-library/react'
import { CryptoCard } from '../CryptoCard'
import { Asset } from '@/lib/data/assets'

// Mock the child components
jest.mock('../CryptoIcon', () => ({
  CryptoIcon: ({ symbol, name }: { symbol: string; name: string }) => (
    <div data-testid="crypto-icon">{symbol} - {name}</div>
  ),
}))

jest.mock('../CryptoSparkline', () => ({
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
  volumeUsd24Hr: 25000000000,
  priceUsd: 45000,
  changePercent24Hr: 5.25,
  vwap24Hr: 44500,
  explorer: 'https://blockchain.info/',
}

describe('CryptoCard', () => {
  it('should render all basic information', () => {
    render(<CryptoCard {...mockAsset} />)

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('$45,000')).toBeInTheDocument()
    expect(screen.getByText('5.25%')).toBeInTheDocument()
  })

  it('should render CryptoIcon with correct props', () => {
    render(<CryptoCard {...mockAsset} />)

    const cryptoIcon = screen.getByTestId('crypto-icon')
    expect(cryptoIcon).toHaveTextContent('BTC - Bitcoin')
  })

  it('should render CryptoSparkline with correct symbol', () => {
    render(<CryptoCard {...mockAsset} />)

    const cryptoSparkline = screen.getByTestId('crypto-sparkline')
    expect(cryptoSparkline).toHaveTextContent('BTC')
  })

  it('should apply green color class for positive price change', () => {
    render(<CryptoCard {...mockAsset} />)

    const changeElement = screen.getByText('5.25%')
    expect(changeElement.parentElement).toHaveClass('text-green-700')
  })

  it('should apply red color class for negative price change', () => {
    const negativeAsset = { ...mockAsset, changePercent24Hr: -3.45 }
    render(<CryptoCard {...negativeAsset} />)

    const changeElement = screen.getByText('-3.45%')
    expect(changeElement.parentElement).toHaveClass('text-red-700')
  })

  it('should handle zero price change', () => {
    const zeroChangeAsset = { ...mockAsset, changePercent24Hr: 0 }
    render(<CryptoCard {...zeroChangeAsset} />)

    const changeElement = screen.getByText('0.00%')
    expect(changeElement.parentElement).toHaveClass('text-green-700')
  })

  it('should format price correctly', () => {
    const highPriceAsset = { ...mockAsset, priceUsd: 1234567.89 }
    render(<CryptoCard {...highPriceAsset} />)

    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument()
  })

  it('should format percentage correctly', () => {
    const preciseChangeAsset = { ...mockAsset, changePercent24Hr: 12.3456 }
    render(<CryptoCard {...preciseChangeAsset} />)

    expect(screen.getByText('12.35%')).toBeInTheDocument()
  })

  it('should have glassmorphic styling on card', () => {
    const { container } = render(<CryptoCard {...mockAsset} />)
    
    const card = container.querySelector('.glassmorphic')
    expect(card).toBeInTheDocument()
  })

  it('should handle very large numbers', () => {
    const largeAsset = { 
      ...mockAsset, 
      priceUsd: 999999999,
      changePercent24Hr: 999.99
    }
    render(<CryptoCard {...largeAsset} />)

    expect(screen.getByText('$999,999,999')).toBeInTheDocument()
    expect(screen.getByText('999.99%')).toBeInTheDocument()
  })
})