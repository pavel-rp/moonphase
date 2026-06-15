const mockAnalyzeAsset = jest.fn();
const mockAnalyzeAssetStream = jest.fn();

const MockOpenAiAnalysisAdapter = jest.fn();
const MockMockAiAnalysisAdapter = jest.fn();

const MockNewsAdapter = jest.fn().mockImplementation(() => ({ fetchNews: jest.fn() }));
const MockMockNewsAdapter = jest.fn().mockImplementation(() => ({ fetchNews: jest.fn() }));

jest.mock('@/adapters/openai/OpenAiAnalysisAdapter', () => ({
  OpenAiAnalysisAdapter: MockOpenAiAnalysisAdapter,
}));
jest.mock('@/adapters/mock/MockAiAnalysisAdapter', () => ({
  MockAiAnalysisAdapter: MockMockAiAnalysisAdapter,
}));
jest.mock('@/adapters/news/NewsAdapter', () => ({
  NewsAdapter: MockNewsAdapter,
}));
jest.mock('@/adapters/news/MockNewsAdapter', () => ({
  MockNewsAdapter: MockMockNewsAdapter,
}));

// Must re-import after mocks are set up and module cache is clean (also resets
// the per-mode memoization Map between tests).
beforeEach(() => {
  jest.resetModules();
  const aiImpl = () => ({
    analyzeAsset: mockAnalyzeAsset,
    analyzeAssetStream: mockAnalyzeAssetStream,
  });
  MockOpenAiAnalysisAdapter.mockReset();
  MockOpenAiAnalysisAdapter.mockImplementation(aiImpl);
  MockMockAiAnalysisAdapter.mockReset();
  MockMockAiAnalysisAdapter.mockImplementation(aiImpl);
  MockNewsAdapter.mockClear();
  MockMockNewsAdapter.mockClear();
});

describe('getAiAnalysisDeps', () => {
  it('returns an object with an ai property implementing AiAnalysisPort for either mode', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');
    for (const mode of ['live', 'mock'] as const) {
      const deps = await getAiAnalysisDeps(mode);
      expect(deps).toHaveProperty('ai');
      expect(typeof deps.ai.analyzeAsset).toBe('function');
      expect(typeof deps.ai.analyzeAssetStream).toBe('function');
    }
  });

  it('builds the OpenAI adapter for live mode', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');
    await getAiAnalysisDeps('live');

    expect(MockOpenAiAnalysisAdapter).toHaveBeenCalledTimes(1);
    expect(MockMockAiAnalysisAdapter).not.toHaveBeenCalled();
  });

  it('builds the mock adapter for mock mode (no OpenAI adapter, no API key needed)', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');
    await getAiAnalysisDeps('mock');

    expect(MockMockAiAnalysisAdapter).toHaveBeenCalledTimes(1);
    expect(MockOpenAiAnalysisAdapter).not.toHaveBeenCalled();
  });

  it('uses MockNewsAdapter when NEWS_API_KEY is not set (live)', async () => {
    delete process.env.NEWS_API_KEY;

    const { getAiAnalysisDeps } = await import('../compositionRoot');
    await getAiAnalysisDeps('live');

    expect(MockMockNewsAdapter).toHaveBeenCalled();
    expect(MockNewsAdapter).not.toHaveBeenCalled();
  });

  it('uses NewsAdapter when NEWS_API_KEY is set (live)', async () => {
    process.env.NEWS_API_KEY = 'test-key';

    const { getAiAnalysisDeps } = await import('../compositionRoot');
    await getAiAnalysisDeps('live');

    expect(MockNewsAdapter).toHaveBeenCalled();
    expect(MockMockNewsAdapter).not.toHaveBeenCalled();

    delete process.env.NEWS_API_KEY;
  });

  it('returns the same instance on concurrent calls for the same mode (singleton)', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');

    const [deps1, deps2] = await Promise.all([
      getAiAnalysisDeps('live'),
      getAiAnalysisDeps('live'),
    ]);

    expect(deps1).toBe(deps2);
    expect(MockOpenAiAnalysisAdapter).toHaveBeenCalledTimes(1);
  });

  it('caches each mode independently', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');

    const live = await getAiAnalysisDeps('live');
    const mock = await getAiAnalysisDeps('mock');

    expect(live).not.toBe(mock);
    expect(MockOpenAiAnalysisAdapter).toHaveBeenCalledTimes(1);
    expect(MockMockAiAnalysisAdapter).toHaveBeenCalledTimes(1);
  });

  it('resets the cache on failure so a later call can retry', async () => {
    // Simulate a construction-time failure (e.g. missing OPENAI_API_KEY).
    MockOpenAiAnalysisAdapter.mockImplementation(() => {
      throw new Error('construction failed');
    });

    const { getAiAnalysisDeps } = await import('../compositionRoot');

    const p1 = getAiAnalysisDeps('live');
    await expect(p1).rejects.toThrow('construction failed');

    // After rejection, the per-mode cache entry must be cleared so the next call
    // creates a new promise (rather than re-using the cached rejected one).
    const p2 = getAiAnalysisDeps('live');
    expect(p2).not.toBe(p1);
    await expect(p2).rejects.toThrow('construction failed');
  });

  it('returns the same instance on sequential calls for the same mode (singleton)', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');

    const deps1 = await getAiAnalysisDeps('mock');
    const deps2 = await getAiAnalysisDeps('mock');

    expect(deps1).toBe(deps2);
    expect(MockMockAiAnalysisAdapter).toHaveBeenCalledTimes(1);
  });
});
