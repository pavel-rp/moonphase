import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Grid, GridItem } from '../grid'

describe('Grid', () => {
  it('should render with default props', () => {
    render(
      <Grid>
        <div>Child 1</div>
        <div>Child 2</div>
      </Grid>
    )

    const grid = screen.getByText('Child 1').parentElement
    expect(grid).toHaveClass('grid')
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('sm:grid-cols-2')
    expect(grid).toHaveClass('md:grid-cols-3')
    expect(grid).toHaveClass('lg:grid-cols-4')
    expect(grid).toHaveClass('gap-6')
  })

  it('should render with custom colsClass', () => {
    render(
      <Grid colsClass="grid-cols-2 md:grid-cols-4">
        <div>Child</div>
      </Grid>
    )

    const grid = screen.getByText('Child').parentElement
    expect(grid).toHaveClass('grid-cols-2')
    expect(grid).toHaveClass('md:grid-cols-4')
  })

  it('should render with custom gapClass', () => {
    render(
      <Grid gapClass="gap-4">
        <div>Child</div>
      </Grid>
    )

    const grid = screen.getByText('Child').parentElement
    expect(grid).toHaveClass('gap-4')
  })

  it('should render with custom className', () => {
    render(
      <Grid className="custom-grid">
        <div>Child</div>
      </Grid>
    )

    const grid = screen.getByText('Child').parentElement
    expect(grid).toHaveClass('custom-grid')
  })

  it('should pass through other props', () => {
    render(
      <Grid data-testid="test-grid">
        <div>Child</div>
      </Grid>
    )

    expect(screen.getByTestId('test-grid')).toBeInTheDocument()
  })
})

describe('GridItem', () => {
  it('should render with default span (1)', () => {
    render(
      <GridItem>
        <div>Item</div>
      </GridItem>
    )

    const item = screen.getByText('Item').parentElement
    expect(item).toHaveClass('col-span-1')
    expect(item).toHaveClass('md:col-span-1')
  })

  it('should render with custom span', () => {
    render(
      <GridItem span={2}>
        <div>Item</div>
      </GridItem>
    )

    const item = screen.getByText('Item').parentElement
    expect(item).toHaveClass('col-span-1')
    expect(item).toHaveClass('md:col-span-2')
  })

  it('should render with large span', () => {
    render(
      <GridItem span={6}>
        <div>Item</div>
      </GridItem>
    )

    const item = screen.getByText('Item').parentElement
    expect(item).toHaveClass('col-span-1')
    expect(item).toHaveClass('md:col-span-6')
  })

  it('should render with custom className', () => {
    render(
      <GridItem className="custom-item">
        <div>Item</div>
      </GridItem>
    )

    const item = screen.getByText('Item').parentElement
    expect(item).toHaveClass('custom-item')
  })

  it('should pass through other props', () => {
    render(
      <GridItem data-testid="test-item">
        <div>Item</div>
      </GridItem>
    )

    expect(screen.getByTestId('test-item')).toBeInTheDocument()
  })

  it('should handle maximum span value', () => {
    render(
      <GridItem span={12}>
        <div>Item</div>
      </GridItem>
    )

    const item = screen.getByText('Item').parentElement
    expect(item).toHaveClass('md:col-span-12')
  })
})

describe('Grid.Item', () => {
  it('should be accessible as Grid.Item', () => {
    render(
      <Grid.Item span={3}>
        <div>Grid Item</div>
      </Grid.Item>
    )

    const item = screen.getByText('Grid Item').parentElement
    expect(item).toHaveClass('md:col-span-3')
  })
})