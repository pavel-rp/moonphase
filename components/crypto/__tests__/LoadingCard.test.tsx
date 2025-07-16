import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingCard from '../card/LoadingCard'

// Mock LoadingSparkline
jest.mock('../LoadingSparkline', () => ({
  __esModule: true,
  default: ({ opacity }: { opacity: number }) => (
    <div data-testid="loading-sparkline" data-opacity={opacity}>
      Loading Sparkline
    </div>
  ),
}))

describe('LoadingCard', () => {
  it('should render with proper structure', () => {
    render(<LoadingCard />)

    // Check for Card container
    const card = screen.getByText('Loading Sparkline').closest('[data-slot="card"]')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('glassmorphic')
    expect(card).toHaveClass('animate-pulse')
    expect(card).toHaveClass('min-h-[210px]')
  })

  it('should have glassmorphic styling', () => {
    const { container } = render(<LoadingCard />)
    
    const card = container.querySelector('.glassmorphic')
    expect(card).toBeInTheDocument()
  })

  it('should have animate-pulse class', () => {
    const { container } = render(<LoadingCard />)
    
    const card = container.querySelector('.animate-pulse')
    expect(card).toBeInTheDocument()
  })

  it('should have proper minimum height', () => {
    const { container } = render(<LoadingCard />)
    
    const card = container.querySelector('.min-h-\\[210px\\]')
    expect(card).toBeInTheDocument()
  })

  it('should render skeleton elements', () => {
    const { container } = render(<LoadingCard />)
    
    // Check for skeleton elements with opacity
    const skeletonElements = container.querySelectorAll('.opacity-30')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('should render LoadingSparkline with correct opacity', () => {
    render(<LoadingCard />)
    
    const loadingSparkline = screen.getByTestId('loading-sparkline')
    expect(loadingSparkline).toBeInTheDocument()
    expect(loadingSparkline).toHaveAttribute('data-opacity', '0.2')
  })

  it('should have flex layout structure', () => {
    const { container } = render(<LoadingCard />)
    
    const card = container.querySelector('.flex.flex-col.justify-between')
    expect(card).toBeInTheDocument()
  })

  it('should render header section with skeleton elements', () => {
    const { container } = render(<LoadingCard />)
    
    // Check for header section
    const headerSection = container.querySelector('.flex.items-center.justify-between')
    expect(headerSection).toBeInTheDocument()
    
    // Check for skeleton text elements
    const skeletonTexts = headerSection?.querySelectorAll('.bg-gray-400.rounded')
    expect(skeletonTexts?.length).toBeGreaterThan(0)
  })

  it('should render icon placeholder', () => {
    const { container } = render(<LoadingCard />)
    
    // Check for circular icon placeholder
    const iconPlaceholder = container.querySelector('.w-8.h-8.bg-gray-400.rounded-full')
    expect(iconPlaceholder).toBeInTheDocument()
  })

  it('should render price section with skeleton', () => {
    const { container } = render(<LoadingCard />)
    
    // Check for price skeleton in the bottom section
    const priceSkeleton = container.querySelector('.h-6.bg-gray-400.rounded')
    expect(priceSkeleton).toBeInTheDocument()
  })
})