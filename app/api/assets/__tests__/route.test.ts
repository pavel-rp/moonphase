/** @jest-environment node */

import { ExternalException } from '@/lib/errors';

jest.mock('@/lib/data/assets');

import { GET } from '../route';
import { fetchAssets } from '@/lib/data/assets';

const mockFetchAssets = fetchAssets as jest.MockedFunction<typeof fetchAssets>;

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/assets');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
}

describe('GET /api/assets', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with assets on success', async () => {
    mockFetchAssets.mockResolvedValue([]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
  });

  it('returns 429 for RateLimited errors', async () => {
    mockFetchAssets.mockRejectedValue(
      new ExternalException({ kind: 'RateLimited' }, 'Too many requests'),
    );
    const res = await GET(makeRequest());
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Too many requests');
  });

  it('returns 400 for InvalidRequest errors', async () => {
    mockFetchAssets.mockRejectedValue(
      new ExternalException({ kind: 'InvalidRequest' }, 'Bad param'),
    );
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Bad param');
  });

  it('returns 502 for Unavailable errors', async () => {
    mockFetchAssets.mockRejectedValue(
      new ExternalException({ kind: 'Unavailable' }, 'CoinCap down'),
    );
    const res = await GET(makeRequest());
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('CoinCap down');
  });

  it('returns 502 for untyped errors', async () => {
    mockFetchAssets.mockRejectedValue(new Error('Something broke'));
    const res = await GET(makeRequest());
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Upstream unavailable');
  });
});
