import { getAiAnalysis, getAiAnalysisStream } from '../getAiAnalysis';
import { AiAnalysisPort } from '@/ports/AiAnalysisPort';
import { Asset } from '@/domain/asset';
import { MarketData } from '@/domain/marketData';

describe('getAiAnalysis', () => {
  let mockPort: jest.Mocked<AiAnalysisPort>;
  let mockAsset: Asset;
  let mockMarketData: MarketData[];

  beforeEach(() => {
    mockPort = {
      analyzeAsset: jest.fn(),
      analyzeAssetStream: jest.fn(),
    };

    mockAsset = {
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
    };

    mockMarketData = [
      {
        symbol: 'BTC',
        marketCapUsd: 800000000000,
        circulatingSupply: 19000000,
        maxSupply: 21000000,
        vwap24hUsd: 44500,
        dominancePercent: 50.5,
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAiAnalysis', () => {
    it('should return analysis from port', async () => {
      const expectedAnalysis = 'Bitcoin shows strong bullish momentum...';
      mockPort.analyzeAsset.mockResolvedValue(expectedAnalysis);

      const result = await getAiAnalysis({ ai: mockPort }, mockAsset, mockMarketData);

      expect(result).toBe(expectedAnalysis);
      expect(mockPort.analyzeAsset).toHaveBeenCalledTimes(1);
      expect(mockPort.analyzeAsset).toHaveBeenCalledWith(mockAsset, mockMarketData);
    });

    it('should handle different assets', async () => {
      const ethAsset: Asset = {
        id: 'ethereum',
        rank: 2,
        symbol: 'ETH',
        name: 'Ethereum',
        supply: 120000000,
        maxSupply: null,
        marketCapUsd: 400000000000,
        volumeUsd24Hr: 15000000000,
        priceUsd: 3200,
        changePercent24Hr: 2.5,
        vwap24Hr: 3150,
        explorer: 'https://etherscan.io/',
      };
      const ethMarketData: MarketData[] = [
        {
          symbol: 'ETH',
          marketCapUsd: 400000000000,
          circulatingSupply: 120000000,
          maxSupply: null,
          vwap24hUsd: 3150,
          dominancePercent: 20.5,
        },
      ];
      const expectedAnalysis = 'Ethereum analysis...';
      mockPort.analyzeAsset.mockResolvedValue(expectedAnalysis);

      const result = await getAiAnalysis({ ai: mockPort }, ethAsset, ethMarketData);

      expect(result).toBe(expectedAnalysis);
      expect(mockPort.analyzeAsset).toHaveBeenCalledWith(ethAsset, ethMarketData);
    });

    it('should propagate errors from port', async () => {
      const error = new Error('Analysis failed');
      mockPort.analyzeAsset.mockRejectedValue(error);

      await expect(
        getAiAnalysis({ ai: mockPort }, mockAsset, mockMarketData)
      ).rejects.toThrow('Analysis failed');
      expect(mockPort.analyzeAsset).toHaveBeenCalledTimes(1);
      expect(mockPort.analyzeAsset).toHaveBeenCalledWith(mockAsset, mockMarketData);
    });
  });

  describe('getAiAnalysisStream', () => {
    it('should return async iterable from port', async () => {
      const chunks = ['Bitcoin ', 'shows ', 'strong ', 'momentum'];
      const asyncIterable = async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      };
      mockPort.analyzeAssetStream.mockReturnValue(asyncIterable());

      const stream = getAiAnalysisStream({ ai: mockPort }, mockAsset, mockMarketData);
      const results: string[] = [];

      for await (const chunk of stream) {
        results.push(chunk);
      }

      expect(results).toEqual(chunks);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledTimes(1);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledWith(mockAsset, mockMarketData);
    });

    it('should handle empty stream', async () => {
      const asyncIterable = async function* () {
        // Empty stream
      };
      mockPort.analyzeAssetStream.mockReturnValue(asyncIterable());

      const stream = getAiAnalysisStream({ ai: mockPort }, mockAsset, mockMarketData);
      const results: string[] = [];

      for await (const chunk of stream) {
        results.push(chunk);
      }

      expect(results).toEqual([]);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledWith(mockAsset, mockMarketData);
    });

    it('should handle different assets', async () => {
      const ethAsset: Asset = {
        id: 'ethereum',
        rank: 2,
        symbol: 'ETH',
        name: 'Ethereum',
        supply: 120000000,
        maxSupply: null,
        marketCapUsd: 400000000000,
        volumeUsd24Hr: 15000000000,
        priceUsd: 3200,
        changePercent24Hr: 2.5,
        vwap24Hr: 3150,
        explorer: 'https://etherscan.io/',
      };
      const ethMarketData: MarketData[] = [
        {
          symbol: 'ETH',
          marketCapUsd: 400000000000,
          circulatingSupply: 120000000,
          maxSupply: null,
          vwap24hUsd: 3150,
          dominancePercent: 20.5,
        },
      ];
      const chunks = ['Ethereum ', 'analysis'];
      const asyncIterable = async function* () {
        yield chunks[0];
        yield chunks[1];
      };
      mockPort.analyzeAssetStream.mockReturnValue(asyncIterable());

      const stream = getAiAnalysisStream({ ai: mockPort }, ethAsset, ethMarketData);
      const results: string[] = [];

      for await (const chunk of stream) {
        results.push(chunk);
      }

      expect(results).toEqual(chunks);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledWith(ethAsset, ethMarketData);
    });
  });
});

