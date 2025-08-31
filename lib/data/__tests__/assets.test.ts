import { fetchAssets } from '../assets'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('fetchAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock environment variable
    process.env.COINCAP_API_KEY = 'test-api-key'
    // Mock timers to handle the 8-second delay
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should fetch and transform assets data', async () => {
    const mockResponse = {
      data: [
        {
          id: 'bitcoin',
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          supply: '19000000.0000000000000000',
          maxSupply: '21000000.0000000000000000',
          marketCapUsd: '800000000000.0000000000000000',
          volumeUsd24Hr: '25000000000.0000000000000000',
          priceUsd: '45000.0000000000000000',
          changePercent24Hr: '5.2500000000000000',
          vwap24Hr: '44500.0000000000000000',
          explorer: 'https://blockchain.info/',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const fetchPromise = fetchAssets()
    
    // Fast-forward the 8-second delay
    await jest.advanceTimersByTimeAsync(8000)
    
    const result = await fetchPromise

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
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
    })
  })

  it('should handle null maxSupply', async () => {
    const mockResponse = {
      data: [
        {
          id: 'ethereum',
          rank: '2',
          symbol: 'ETH',
          name: 'Ethereum',
          supply: '120000000.0000000000000000',
          maxSupply: null,
          marketCapUsd: '400000000000.0000000000000000',
          volumeUsd24Hr: '15000000000.0000000000000000',
          priceUsd: '3200.0000000000000000',
          changePercent24Hr: '2.5000000000000000',
          vwap24Hr: '3150.0000000000000000',
          explorer: 'https://etherscan.io/',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const fetchPromise = fetchAssets()
    await jest.advanceTimersByTimeAsync(8000)
    
    const result = await fetchPromise

    expect(result[0].maxSupply).toBeNull()
  })

  it('should throw error when API request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const fetchPromise = fetchAssets()

    await expect(fetchPromise).rejects.toThrow('API error 500')
  })

  it('should call API with correct parameters', async () => {
    const mockResponse = { data: [] }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const fetchPromise = fetchAssets()
    await jest.advanceTimersByTimeAsync(8000)
    
    await fetchPromise

    expect(mockFetch).toHaveBeenCalledWith(
      'https://rest.coincap.io/v3/assets?limit=19&offset=0&apiKey=test-api-key',
      { next: { revalidate: 60 } }
    )
  })

  it('should handle empty response', async () => {
    const mockResponse = { data: [] }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const fetchPromise = fetchAssets()
    await jest.advanceTimersByTimeAsync(8000)
    
    const result = await fetchPromise

    expect(result).toEqual([])
  })

  it('should transform string numbers to actual numbers', async () => {
    const mockResponse = {
      data: [
        {
          id: 'test',
          rank: '999',
          symbol: 'TEST',
          name: 'Test Coin',
          supply: '1000.5000000000000000',
          maxSupply: '2000.0000000000000000',
          marketCapUsd: '50000.7500000000000000',
          volumeUsd24Hr: '1000.2500000000000000',
          priceUsd: '50.2500000000000000',
          changePercent24Hr: '-1.5000000000000000',
          vwap24Hr: '49.7500000000000000',
          explorer: 'https://example.com/',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const fetchPromise = fetchAssets()
    await jest.advanceTimersByTimeAsync(8000)
    
    const result = await fetchPromise

    expect(typeof result[0].rank).toBe('number')
    expect(typeof result[0].supply).toBe('number')
    expect(typeof result[0].priceUsd).toBe('number')
    expect(result[0].rank).toBe(999)
    expect(result[0].supply).toBe(1000.5)
    expect(result[0].changePercent24Hr).toBe(-1.5)
  })
})