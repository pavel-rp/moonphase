import { fetchAssets } from '../assets'

// Mock the fetch function
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('fetchAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock setTimeout to avoid waiting
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
          supply: '19000000.5',
          maxSupply: '21000000',
          marketCapUsd: '800000000000.123',
          volumeUsd24Hr: '25000000000.456',
          priceUsd: '45000.789',
          changePercent24Hr: '5.25',
          vwap24Hr: '44500.123',
          explorer: 'https://blockchain.info/',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const fetchPromise = fetchAssets()
    
    // Fast-forward timers to skip the delay
    jest.advanceTimersByTime(8000)
    
    const result = await fetchPromise

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'bitcoin',
      rank: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      supply: 19000000.5,
      maxSupply: 21000000,
      marketCapUsd: 800000000000.123,
      volumeUsd24Hr: 25000000000.456,
      priceUsd: 45000.789,
      changePercent24Hr: 5.25,
      vwap24Hr: 44500.123,
      explorer: 'https://blockchain.info/',
    })
  })

  it('should handle null maxSupply', async () => {
    const mockResponse = {
      data: [
        {
          id: 'ethereum',
          rank: 2,
          symbol: 'ETH',
          name: 'Ethereum',
          supply: '120000000',
          maxSupply: null,
          marketCapUsd: '400000000000',
          volumeUsd24Hr: '15000000000',
          priceUsd: '3000',
          changePercent24Hr: '-2.5',
          vwap24Hr: '3100',
          explorer: 'https://etherscan.io/',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const fetchPromise = fetchAssets()
    jest.advanceTimersByTime(8000)
    
    const result = await fetchPromise

    expect(result[0].maxSupply).toBeNull()
  })

  it('should throw error when API request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const fetchPromise = fetchAssets()
    jest.advanceTimersByTime(8000)

    await expect(fetchPromise).rejects.toThrow('API error 404')
  })

  it('should call API with correct parameters', async () => {
    const mockResponse = { data: [] }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const fetchPromise = fetchAssets()
    jest.advanceTimersByTime(8000)
    
    await fetchPromise

    expect(mockFetch).toHaveBeenCalledWith(
      `https://rest.coincap.io/v3/assets?limit=15&offset=0&apiKey=${process.env.COINCAP_API_KEY}`,
      { next: { revalidate: 60 } }
    )
  })

  it('should handle empty response', async () => {
    const mockResponse = { data: [] }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const fetchPromise = fetchAssets()
    jest.advanceTimersByTime(8000)
    
    const result = await fetchPromise

    expect(result).toHaveLength(0)
  })

  it('should transform string numbers to actual numbers', async () => {
    const mockResponse = {
      data: [
        {
          id: 'test',
          rank: 1,
          symbol: 'TEST',
          name: 'Test',
          supply: '1000.5',
          maxSupply: '2000.75',
          marketCapUsd: '50000.25',
          volumeUsd24Hr: '10000.125',
          priceUsd: '50.5',
          changePercent24Hr: '1.23',
          vwap24Hr: '51.75',
          explorer: 'https://test.com',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const fetchPromise = fetchAssets()
    jest.advanceTimersByTime(8000)
    
    const result = await fetchPromise

    expect(typeof result[0].supply).toBe('number')
    expect(typeof result[0].maxSupply).toBe('number')
    expect(typeof result[0].marketCapUsd).toBe('number')
    expect(typeof result[0].volumeUsd24Hr).toBe('number')
    expect(typeof result[0].priceUsd).toBe('number')
    expect(typeof result[0].changePercent24Hr).toBe('number')
    expect(typeof result[0].vwap24Hr).toBe('number')
  })
})