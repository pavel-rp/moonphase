import { getAiAnalysis, getAiAnalysisStream } from '../getAiAnalysis';
import { AiAnalysisPort } from '@/ports/AiAnalysisPort';

describe('getAiAnalysis', () => {
  let mockPort: jest.Mocked<AiAnalysisPort>;

  beforeEach(() => {
    mockPort = {
      analyzeAsset: jest.fn(),
      analyzeAssetStream: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAiAnalysis', () => {
    it('should return analysis from port', async () => {
      const expectedAnalysis = 'Bitcoin shows strong bullish momentum...';
      mockPort.analyzeAsset.mockResolvedValue(expectedAnalysis);

      const result = await getAiAnalysis({ ai: mockPort }, 'BTC');

      expect(result).toBe(expectedAnalysis);
      expect(mockPort.analyzeAsset).toHaveBeenCalledTimes(1);
      expect(mockPort.analyzeAsset).toHaveBeenCalledWith('BTC');
    });

    it('should handle different assets', async () => {
      const expectedAnalysis = 'Ethereum analysis...';
      mockPort.analyzeAsset.mockResolvedValue(expectedAnalysis);

      const result = await getAiAnalysis({ ai: mockPort }, 'ETH');

      expect(result).toBe(expectedAnalysis);
      expect(mockPort.analyzeAsset).toHaveBeenCalledWith('ETH');
    });

    it('should propagate errors from port', async () => {
      const error = new Error('Analysis failed');
      mockPort.analyzeAsset.mockRejectedValue(error);

      await expect(
        getAiAnalysis({ ai: mockPort }, 'BTC')
      ).rejects.toThrow('Analysis failed');
      expect(mockPort.analyzeAsset).toHaveBeenCalledTimes(1);
      expect(mockPort.analyzeAsset).toHaveBeenCalledWith('BTC');
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

      const stream = getAiAnalysisStream({ ai: mockPort }, 'BTC');
      const results: string[] = [];

      for await (const chunk of stream) {
        results.push(chunk);
      }

      expect(results).toEqual(chunks);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledTimes(1);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledWith('BTC');
    });

    it('should handle empty stream', async () => {
      const asyncIterable = async function* () {
        // Empty stream
      };
      mockPort.analyzeAssetStream.mockReturnValue(asyncIterable());

      const stream = getAiAnalysisStream({ ai: mockPort }, 'BTC');
      const results: string[] = [];

      for await (const chunk of stream) {
        results.push(chunk);
      }

      expect(results).toEqual([]);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledWith('BTC');
    });

    it('should handle different assets', async () => {
      const chunks = ['Ethereum ', 'analysis'];
      const asyncIterable = async function* () {
        yield chunks[0];
        yield chunks[1];
      };
      mockPort.analyzeAssetStream.mockReturnValue(asyncIterable());

      const stream = getAiAnalysisStream({ ai: mockPort }, 'ETH');
      const results: string[] = [];

      for await (const chunk of stream) {
        results.push(chunk);
      }

      expect(results).toEqual(chunks);
      expect(mockPort.analyzeAssetStream).toHaveBeenCalledWith('ETH');
    });
  });
});

