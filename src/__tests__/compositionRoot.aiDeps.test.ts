const mockAnalyzeAsset = jest.fn();
const mockAnalyzeAssetStream = jest.fn();

const MockOpenAiAnalysisAdapter = jest.fn();

const MockNewsAdapter = jest.fn().mockImplementation(() => ({ fetchNews: jest.fn() }));
const MockMockNewsAdapter = jest.fn().mockImplementation(() => ({ fetchNews: jest.fn() }));

jest.mock('@/adapters/openai/OpenAiAnalysisAdapter', () => ({
  OpenAiAnalysisAdapter: MockOpenAiAnalysisAdapter,
}));
jest.mock('@/adapters/news/NewsAdapter', () => ({
  NewsAdapter: MockNewsAdapter,
}));
jest.mock('@/adapters/news/MockNewsAdapter', () => ({
  MockNewsAdapter: MockMockNewsAdapter,
}));

// Must re-import after mocks are set up and module cache is clean
beforeEach(() => {
  jest.resetModules();
  MockOpenAiAnalysisAdapter.mockReset();
  MockOpenAiAnalysisAdapter.mockImplementation(() => ({
    analyzeAsset: mockAnalyzeAsset,
    analyzeAssetStream: mockAnalyzeAssetStream,
  }));
  MockNewsAdapter.mockClear();
  MockMockNewsAdapter.mockClear();
});

describe('getAiAnalysisDeps', () => {
  it('returns an object with an ai property implementing AiAnalysisPort', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');
    const deps = await getAiAnalysisDeps();

    expect(deps).toHaveProperty('ai');
    expect(typeof deps.ai.analyzeAsset).toBe('function');
    expect(typeof deps.ai.analyzeAssetStream).toBe('function');
  });

  it('uses MockNewsAdapter when NEWS_API_KEY is not set', async () => {
    delete process.env.NEWS_API_KEY;

    const { getAiAnalysisDeps } = await import('../compositionRoot');
    await getAiAnalysisDeps();

    expect(MockMockNewsAdapter).toHaveBeenCalled();
    expect(MockNewsAdapter).not.toHaveBeenCalled();
  });

  it('uses NewsAdapter when NEWS_API_KEY is set', async () => {
    process.env.NEWS_API_KEY = 'test-key';

    const { getAiAnalysisDeps } = await import('../compositionRoot');
    await getAiAnalysisDeps();

    expect(MockNewsAdapter).toHaveBeenCalled();
    expect(MockMockNewsAdapter).not.toHaveBeenCalled();

    delete process.env.NEWS_API_KEY;
  });

  it('returns the same instance on concurrent calls (singleton)', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');

    const [deps1, deps2] = await Promise.all([
      getAiAnalysisDeps(),
      getAiAnalysisDeps(),
    ]);

    expect(deps1).toBe(deps2);
    expect(MockOpenAiAnalysisAdapter).toHaveBeenCalledTimes(1);
  });

  it('resets the cache on failure so a later call can retry', async () => {
    // Simulate a construction-time failure (e.g. missing OPENAI_API_KEY).
    MockOpenAiAnalysisAdapter.mockImplementation(() => {
      throw new Error('construction failed');
    });

    const { getAiAnalysisDeps } = await import('../compositionRoot');

    const p1 = getAiAnalysisDeps();
    await expect(p1).rejects.toThrow('construction failed');

    // After rejection, cache must be reset so the next call creates a new
    // promise (rather than re-using the cached rejected one).
    const p2 = getAiAnalysisDeps();
    expect(p2).not.toBe(p1);
    await expect(p2).rejects.toThrow('construction failed');
  });

  it('returns the same instance on sequential calls (singleton)', async () => {
    const { getAiAnalysisDeps } = await import('../compositionRoot');

    const deps1 = await getAiAnalysisDeps();
    const deps2 = await getAiAnalysisDeps();

    expect(deps1).toBe(deps2);
    expect(MockOpenAiAnalysisAdapter).toHaveBeenCalledTimes(1);
  });
});
