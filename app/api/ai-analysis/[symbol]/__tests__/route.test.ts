/** @jest-environment node */

import { ExternalException } from '@/lib/errors';

jest.mock('@/lib/data/aiAnalysisServer');

import { POST } from '../route';
import { analyzeAsset } from '@/lib/data/aiAnalysisServer';

const mockAnalyzeAsset = analyzeAsset as jest.MockedFunction<typeof analyzeAsset>;

function makeRequest(symbol: string) {
  return [
    new Request('http://localhost/api/ai-analysis/' + symbol, { method: 'POST' }),
    { params: Promise.resolve({ symbol }) },
  ] as const;
}

describe('POST /api/ai-analysis/[symbol]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with analysis on success', async () => {
    mockAnalyzeAsset.mockResolvedValue('Bullish momentum...');
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.analysis).toBe('Bullish momentum...');
  });

  it('returns 429 for RateLimited errors', async () => {
    mockAnalyzeAsset.mockRejectedValue(
      new ExternalException({ kind: 'RateLimited' }, 'Too many requests'),
    );
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Too many requests');
  });

  it('returns 400 for InvalidRequest errors', async () => {
    mockAnalyzeAsset.mockRejectedValue(
      new ExternalException({ kind: 'InvalidRequest' }, 'Missing API key'),
    );
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing API key');
  });

  it('returns 502 for Unavailable errors', async () => {
    mockAnalyzeAsset.mockRejectedValue(
      new ExternalException({ kind: 'Unavailable' }, 'OpenAI down'),
    );
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('OpenAI down');
  });

  it('returns 502 for untyped errors', async () => {
    mockAnalyzeAsset.mockRejectedValue(new Error('Something broke'));
    const [req, ctx] = makeRequest('BTC');
    const res = await POST(req, ctx);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Something broke');
  });
});
