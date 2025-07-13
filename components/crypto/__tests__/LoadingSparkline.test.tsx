import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingSparkline from '../LoadingSparkline'

// Mock the Sparkline component
jest.mock('../../ui/sparkline', () => ({
  Sparkline: ({ data, className, opacity }: { data: number[]; className: string; opacity: number }) => (
    <div data-testid="sparkline" data-classname={className} data-opacity={opacity}>
      {data.join(',')}
    </div>
  ),
}))

describe('LoadingSparkline', () => {
  it('should render with default props', () => {
    render(<LoadingSparkline />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toBeInTheDocument()
  })

  it('should render with default opacity of 0.2', () => {
    render(<LoadingSparkline />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-opacity', '0.2')
  })

  it('should render with custom opacity', () => {
    render(<LoadingSparkline opacity={0.5} />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-opacity', '0.5')
  })

  it('should apply default className', () => {
    render(<LoadingSparkline />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-classname', 'text-gray-500')
  })

  it('should apply custom className', () => {
    render(<LoadingSparkline className="custom-class" />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-classname', 'text-gray-500 custom-class')
  })

  it('should render with predefined data', () => {
    render(<LoadingSparkline />)

    const sparkline = screen.getByTestId('sparkline')
    // Check that it contains the predefined data points
    expect(sparkline).toHaveTextContent('1,1.0034080652504769')
  })

  it('should have consistent data length', () => {
    render(<LoadingSparkline />)

    const sparkline = screen.getByTestId('sparkline')
    const dataPoints = sparkline.textContent?.split(',')
    expect(dataPoints).toHaveLength(20) // Based on the predefined data in the component
  })

  it('should render with both opacity and className props', () => {
    render(<LoadingSparkline opacity={0.8} className="test-class" />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-opacity', '0.8')
    expect(sparkline).toHaveAttribute('data-classname', 'text-gray-500 test-class')
  })

  it('should use realistic sparkline data', () => {
    render(<LoadingSparkline />)

    const sparkline = screen.getByTestId('sparkline')
    const content = sparkline.textContent
    
    // Should contain decimal numbers (realistic price data)
    expect(content).toMatch(/\d+\.\d+/)
    
    // Should start with 1 (normalized starting point)
    expect(content).toMatch(/^1,/)
  })

  it('should handle edge case opacity values', () => {
    render(<LoadingSparkline opacity={0} />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-opacity', '0')
  })

  it('should handle opacity value of 1', () => {
    render(<LoadingSparkline opacity={1} />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-opacity', '1')
  })
})