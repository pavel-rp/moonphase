import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render with default props', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      )

      const card = screen.getByText('Card content').closest('[data-slot="card"]')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('text-card-foreground')
      expect(card).toHaveClass('rounded-3xl')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('shadow-sm')
    })

    it('should apply custom className', () => {
      render(
        <Card className="custom-card">
          <div>Card content</div>
        </Card>
      )

      const card = screen.getByText('Card content').closest('[data-slot="card"]')
      expect(card).toHaveClass('custom-card')
    })

    it('should pass through other props', () => {
      render(
        <Card data-testid="test-card">
          <div>Card content</div>
        </Card>
      )

      expect(screen.getByTestId('test-card')).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('should render with default props', () => {
      render(
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      )

      const header = screen.getByText('Header content').closest('[data-slot="card-header"]')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('@container/card-header')
      expect(header).toHaveClass('px-6')
      expect(header).toHaveClass('gap-1.5')
    })

    it('should apply custom className', () => {
      render(
        <CardHeader className="custom-header">
          <div>Header content</div>
        </CardHeader>
      )

      const header = screen.getByText('Header content').closest('[data-slot="card-header"]')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render with default props', () => {
      render(<CardTitle>Card Title</CardTitle>)

      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveAttribute('data-slot', 'card-title')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('font-semibold')
    })

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Card Title</CardTitle>)

      const title = screen.getByText('Card Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render with default props', () => {
      render(<CardDescription>Card Description</CardDescription>)

      const description = screen.getByText('Card Description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveAttribute('data-slot', 'card-description')
      expect(description).toHaveClass('text-sm')
    })

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc">Card Description</CardDescription>)

      const description = screen.getByText('Card Description')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('should render with default props', () => {
      render(
        <CardContent>
          <div>Content</div>
        </CardContent>
      )

      const content = screen.getByText('Content').closest('[data-slot="card-content"]')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('px-6')
    })

    it('should apply custom className', () => {
      render(
        <CardContent className="custom-content">
          <div>Content</div>
        </CardContent>
      )

      const content = screen.getByText('Content').closest('[data-slot="card-content"]')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('Complete Card', () => {
    it('should render a complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()

      const card = screen.getByText('Test Title').closest('[data-slot="card"]')
      const header = screen.getByText('Test Title').closest('[data-slot="card-header"]')
      const content = screen.getByText('Test content').closest('[data-slot="card-content"]')

      expect(card).toBeInTheDocument()
      expect(header).toBeInTheDocument()
      expect(content).toBeInTheDocument()
    })
  })
})