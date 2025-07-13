import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Sparkline } from '../sparkline'

describe('Sparkline', () => {
  const mockData = [1, 2, 3, 4, 5, 3, 2, 4, 6, 5]

  it('should render with default props', () => {
    const { container } = render(<Sparkline data={mockData} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render with custom height', () => {
    const { container } = render(<Sparkline data={mockData} height={100} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveStyle('height: 100px')
  })

  it('should apply custom className', () => {
    const { container } = render(<Sparkline data={mockData} className="custom-class" />)
    
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom-class')
  })

  it('should render with custom stroke width', () => {
    const { container } = render(<Sparkline data={mockData} strokeWidth={2} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    
    const polyline = svg?.querySelector('polyline[stroke="currentColor"]')
    expect(polyline).toHaveAttribute('stroke-width', '0.04')
  })

  it('should render with custom opacity', () => {
    const { container } = render(<Sparkline data={mockData} opacity={0.5} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    
    const polyline = svg?.querySelector('polyline[stroke="currentColor"]')
    expect(polyline).toHaveAttribute('opacity', '0.5')
  })

  it('should render with custom area opacity', () => {
    const { container } = render(<Sparkline data={mockData} areaOpacity={0.3} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    
    // Check that the gradient uses the custom area opacity
    const gradient = svg?.querySelector('linearGradient stop')
    expect(gradient).toHaveAttribute('stop-opacity', '0.3')
  })

  it('should return null for insufficient data points', () => {
    const { container } = render(<Sparkline data={[1]} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should handle empty data array', () => {
    const { container } = render(<Sparkline data={[]} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should handle data with all same values', () => {
    const sameValueData = [5, 5, 5, 5, 5]
    const { container } = render(<Sparkline data={sameValueData} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should handle negative values', () => {
    const negativeData = [-2, -1, 0, 1, 2]
    const { container } = render(<Sparkline data={negativeData} />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should handle string height prop', () => {
    const { container } = render(<Sparkline data={mockData} height="80" />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should handle invalid string height prop', () => {
    const { container } = render(<Sparkline data={mockData} height="invalid" />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})