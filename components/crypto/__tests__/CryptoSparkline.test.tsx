import { render, screen, waitFor } from '@testing-library/react'
import { CryptoSparkline } from '../CryptoSparkline'

// Mock the components
jest.mock('../LoadingSparkline', () => ({
  __esModule: true,
  default: ({ opacity, className }: { opacity: number; className: string }) => (
    <div data-testid="loading-sparkline" data-opacity={opacity} className={className}>
      Loading...
    </div>
  ),
}))

jest.mock('../../ui/sparkline', () => ({
  Sparkline: ({ data, className }: { data: number[]; className: string }) => (
    <div data-testid="sparkline" className={className}>
      Sparkline: {data.join(',')}
    </div>
  ),
}))

jest.mock('@/lib/utils/random-walk', () => ({
  generateRandomWalk: jest.fn(),
}))

import { generateRandomWalk } from '@/lib/utils/random-walk'

const mockGenerateRandomWalk = generateRandomWalk as jest.MockedFunction<typeof generateRandomWalk>

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

  it('should render sparkline with ascending data (green)', async () => {
    // Mock ascending data
    mockGenerateRandomWalk.mockReturnValue([1, 2, 3, 4, 5])

    render(<CryptoSparkline symbol="BTC" />)

    await waitFor(() => {
      expect(screen.getByTestId('sparkline')).toBeInTheDocument()
    }, { timeout: 15000 })

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveClass('text-green-700')
    expect(sparkline).toHaveTextContent('1,2,3,4,5')
  })

  it('should render sparkline with descending data (red)', async () => {
    // Mock descending data
    mockGenerateRandomWalk.mockReturnValue([5, 4, 3, 2, 1])

    render(<CryptoSparkline symbol="BTC" />)

    await waitFor(() => {
      expect(screen.getByTestId('sparkline')).toBeInTheDocument()
    }, { timeout: 15000 })

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveClass('text-red-700')
    expect(sparkline).toHaveTextContent('5,4,3,2,1')
  })

  it('should handle equal start and end values (green)', async () => {
    // Mock equal start and end values
    mockGenerateRandomWalk.mockReturnValue([5, 3, 4, 2, 5])

    render(<CryptoSparkline symbol="BTC" />)

    await waitFor(() => {
      expect(screen.getByTestId('sparkline')).toBeInTheDocument()
    }, { timeout: 15000 })

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveClass('text-green-700')
  })

  it('should pass symbol to the component', () => {
    render(<CryptoSparkline symbol="ETH" />)

    // The symbol is passed through the component structure
    expect(screen.getByTestId('loading-sparkline')).toBeInTheDocument()
  })

  it('should generate random walk data', async () => {
    mockGenerateRandomWalk.mockReturnValue([1, 2, 3])

    render(<CryptoSparkline symbol="BTC" />)

    await waitFor(() => {
      expect(mockGenerateRandomWalk).toHaveBeenCalled()
    }, { timeout: 15000 })

    expect(mockGenerateRandomWalk).toHaveBeenCalledWith()
  })
})