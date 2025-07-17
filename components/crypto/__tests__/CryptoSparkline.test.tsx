import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CryptoSparkline } from '../crypto-sparkline'
import { generateRandomWalk } from '@/lib/utils/random-walk'

// Mock the random walk function
jest.mock('@/lib/utils/random-walk')
const mockGenerateRandomWalk = generateRandomWalk as jest.MockedFunction<typeof generateRandomWalk>

// Mock the Sparkline component
jest.mock('../../ui/sparkline', () => ({
  Sparkline: ({ data, className }: { data: number[]; className: string }) => (
    <div data-testid="sparkline" data-color={className}>
      {data.join(',')}
    </div>
  ),
}))

// Mock LoadingSparkline
jest.mock('../loading-sparkline', () => ({
  __esModule: true,
  default: ({ opacity, className }: { opacity: number; className: string }) => (
    <div data-testid="loading-sparkline" data-opacity={opacity} className={className}>
      Loading...
    </div>
  ),
}))

describe('CryptoSparkline', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading state initially', () => {
    mockGenerateRandomWalk.mockReturnValue([1, 2, 3, 4, 5])

    render(<CryptoSparkline symbol="BTC" />)

    expect(screen.getByTestId('loading-sparkline')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should apply correct props to loading sparkline', () => {
    mockGenerateRandomWalk.mockReturnValue([1, 2, 3, 4, 5])

    render(<CryptoSparkline symbol="BTC" />)

    const loadingSparkline = screen.getByTestId('loading-sparkline')
    expect(loadingSparkline).toHaveAttribute('data-opacity', '0.5')
    expect(loadingSparkline).toHaveClass('animate-pulse')
  })

  it('should pass symbol to the component', () => {
    render(<CryptoSparkline symbol="ETH" />)
    
    // Component should render with any symbol
    expect(screen.getByTestId('loading-sparkline')).toBeInTheDocument()
  })
})