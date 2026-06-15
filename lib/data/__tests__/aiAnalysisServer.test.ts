/** @jest-environment node */

jest.mock('@/compositionRoot', () => ({
  getAiAnalysisDeps: jest.fn(),
}));

jest.mock('@/usecases/getAiAnalysis', () => ({
  getAiAnalysis: jest.fn(),
  getAiAnalysisStream: jest.fn(),
}));

import { analyzeAsset, analyzeAssetStream } from '../aiAnalysisServer';
import { getAiAnalysisDeps } from '@/compositionRoot';
import { getAiAnalysis, getAiAnalysisStream } from '@/usecases/getAiAnalysis';

const mockGetDeps = getAiAnalysisDeps as jest.MockedFunction<typeof getAiAnalysisDeps>;
const mockGetAnalysis = getAiAnalysis as jest.MockedFunction<typeof getAiAnalysis>;
const mockGetStream = getAiAnalysisStream as jest.MockedFunction<typeof getAiAnalysisStream>;

const deps = { ai: {} } as never;

describe('aiAnalysisServer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDeps.mockResolvedValue(deps);
    // Mode resolution reads the real env; start from a clean slate each test.
    delete process.env.OPENAI_API_KEY;
    delete process.env.VERCEL_ENV;
    delete process.env.AI_ANALYSIS_MODE;
    delete process.env.AI_ANALYSIS_ALLOW_CLIENT_OVERRIDE;
  });

  it('analyzeAsset resolves deps and delegates to the usecase', async () => {
    mockGetAnalysis.mockResolvedValue('Bullish.');
    await expect(analyzeAsset('BTC')).resolves.toBe('Bullish.');
    expect(mockGetDeps).toHaveBeenCalledTimes(1);
    expect(mockGetAnalysis).toHaveBeenCalledWith(deps, 'BTC');
  });

  it('analyzeAssetStream resolves deps and yields the usecase chunks', async () => {
    async function* chunks() {
      yield 'Bull';
      yield 'ish.';
    }
    mockGetStream.mockReturnValue(chunks());

    const collected: string[] = [];
    for await (const chunk of analyzeAssetStream('BTC')) {
      collected.push(chunk);
    }

    expect(collected).toEqual(['Bull', 'ish.']);
    expect(mockGetDeps).toHaveBeenCalledTimes(1);
    expect(mockGetStream).toHaveBeenCalledWith(deps, 'BTC');
  });

  it('selects mock deps when no API key is set', async () => {
    mockGetAnalysis.mockResolvedValue('Mock.');
    await analyzeAsset('BTC');
    expect(mockGetDeps).toHaveBeenCalledWith('mock');
  });

  it('forwards a permitted client override into mode resolution', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.VERCEL_ENV = 'preview';

    async function* chunks() {
      yield 'x';
    }
    mockGetStream.mockReturnValue(chunks());

    const collected: string[] = [];
    for await (const chunk of analyzeAssetStream('BTC', { requestedMode: 'live' })) {
      collected.push(chunk);
    }

    expect(mockGetDeps).toHaveBeenCalledWith('live');
  });
});
