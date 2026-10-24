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

  it('defaults to the first page of 19', async () => {
    mockFetchAssets.mockResolvedValue([]);
    await GET(makeRequest());
    expect(mockFetchAssets).toHaveBeenCalledWith({ limit: 19, offset: 0 });
  });

  it('passes valid limit and offset through as numbers', async () => {
    mockFetchAssets.mockResolvedValue([]);
    await GET(makeRequest({ limit: '10', offset: '20' }));
    expect(mockFetchAssets).toHaveBeenCalledWith({ limit: 10, offset: 20 });
  });

  it.each([
    ['a non-numeric limit', { limit: 'abc' }],
    ['a zero limit', { limit: '0' }],
    ['a limit over the max', { limit: '101' }],
    ['a fractional limit', { limit: '1.5' }],
    ['a negative offset', { offset: '-1' }],
    ['a non-numeric offset', { offset: 'abc' }],
  ])('returns 400 without calling upstream for %s', async (_label, params) => {
    const res = await GET(makeRequest(params));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/limit must be an integer/);
    expect(mockFetchAssets).not.toHaveBeenCalled();
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
