import { prettifyNumber, formatNumber, formatPercent } from '../numbers'

describe('prettifyNumber', () => {
  it('should format small numbers with grouping', () => {
    expect(prettifyNumber(1000)).toBe('1,000')
    expect(prettifyNumber(9999)).toBe('9,999')
  })

  it('should format large numbers with compact notation', () => {
    expect(prettifyNumber(10001)).toBe('10K')
    expect(prettifyNumber(1000000)).toBe('1M')
    expect(prettifyNumber(1500000)).toBe('1.5M')
    expect(prettifyNumber(1000000000)).toBe('1B')
  })

  it('should handle null and undefined', () => {
    expect(prettifyNumber(null)).toBe('0')
    expect(prettifyNumber(undefined)).toBe('0')
  })

  it('should handle zero', () => {
    expect(prettifyNumber(0)).toBe('0')
  })

  it('should handle negative numbers', () => {
    expect(prettifyNumber(-5000)).toBe('-5,000')
    expect(prettifyNumber(-50000)).toBe('-50,000')
  })
})

describe('formatNumber', () => {
  it('should format numbers with 2 decimal places', () => {
    expect(formatNumber(123.456)).toBe('123.46')
    expect(formatNumber(123.4)).toBe('123.4')
    expect(formatNumber(123)).toBe('123')
  })

  it('should handle null and undefined', () => {
    expect(formatNumber(null as unknown as number)).toBe('0')
    expect(formatNumber(undefined as unknown as number)).toBe('0')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle large numbers', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,567.89')
  })
})

describe('formatPercent', () => {
  it('should format percentages with 2 decimal places', () => {
    expect(formatPercent(5.123)).toBe('5.12%')
    expect(formatPercent(5.1)).toBe('5.10%')
    expect(formatPercent(5)).toBe('5.00%')
  })

  it('should handle null and undefined', () => {
    expect(formatPercent(null as unknown as number)).toBe('0.00%')
    expect(formatPercent(undefined as unknown as number)).toBe('0.00%')
  })

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.00%')
  })

  it('should handle negative numbers', () => {
    expect(formatPercent(-5.123)).toBe('-5.12%')
  })
})