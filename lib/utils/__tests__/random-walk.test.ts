import { generateRandomWalk } from '../random-walk'

describe('generateRandomWalk', () => {
  it('should generate an array of the specified length', () => {
    const result = generateRandomWalk({ length: 10 })
    expect(result).toHaveLength(10)
  })

  it('should start with the specified initial value', () => {
    const S0 = 100
    const result = generateRandomWalk({ S0 })
    expect(result[0]).toBe(S0)
  })

  it('should generate different results on each call', () => {
    const result1 = generateRandomWalk({ length: 10, S0: 100 })
    const result2 = generateRandomWalk({ length: 10, S0: 100 })
    
    // Results should be different (extremely unlikely to be identical)
    expect(result1).not.toEqual(result2)
  })

  it('should handle default parameters', () => {
    const result = generateRandomWalk()
    expect(result).toHaveLength(20) // default length
    expect(result[0]).toBe(1) // default S0
  })

  it('should return all positive values when starting with positive S0', () => {
    const result = generateRandomWalk({ length: 10, S0: 100, sigma: 0.01 })
    result.forEach(value => {
      expect(value).toBeGreaterThan(0)
    })
  })

  it('should handle edge cases', () => {
    const result = generateRandomWalk({ length: 1, S0: 50 })
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(50)
  })

  it('should handle custom parameters', () => {
    const params = {
      length: 5,
      S0: 200,
      mu: 0.1,
      sigma: 0.2,
      dt: 0.5
    }
    const result = generateRandomWalk(params)
    expect(result).toHaveLength(5)
    expect(result[0]).toBe(200)
  })

  it('should produce reasonable variance with different sigma values', () => {
    // Test with low volatility
    const lowVolResult = generateRandomWalk({ length: 100, S0: 100, sigma: 0.01 })
    
    // Test with high volatility  
    const highVolResult = generateRandomWalk({ length: 100, S0: 100, sigma: 0.5 })
    
    // Calculate variance for each
    const lowVolVariance = calculateVariance(lowVolResult)
    const highVolVariance = calculateVariance(highVolResult)
    
    // High volatility should generally produce higher variance
    expect(highVolVariance).toBeGreaterThan(lowVolVariance)
  })
})

function calculateVariance(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  return variance
}