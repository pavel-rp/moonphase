/** @jest-environment node */

import { CoinCapAdapter } from '../CoinCapAdapter';
import { get } from '../client';

jest.mock('../client', () => ({ get: jest.fn() }));

const mockGet = get as jest.MockedFunction<typeof get>;

function rawAsset(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    rank: '1',
    symbol: id.toUpperCase(),
    name: id,
    supply: '1',
    maxSupply: null,
    marketCapUsd: '1',
    volumeUsd24Hr: '1',
    priceUsd: '1',
    changePercent24Hr: '1',
    vwap24Hr: '1',
    explorer: null,
    ...overrides,
  };
}

const respond = (data: unknown[]) =>
  mockGet.mockImplementation(async () => new Response(JSON.stringify({ data })));

describe('CoinCapAdapter', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGet.mockReset();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => errorSpy.mockRestore());

  it('logs a malformed asset once, not on every re-parse of the same response', async () => {
    respond([rawAsset('btc'), rawAsset('broken', { priceUsd: null })]);
    const adapter = new CoinCapAdapter();

    const first = await adapter.listAssets({ limit: 2 });
    await adapter.listAssets({ limit: 2 });
    await adapter.listAssets({ limit: 3 });

    expect(first.map((a) => a.id)).toEqual(['btc']);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][1]).toMatchObject({ droppedAsset: 'broken' });
  });

  it('logs each newly malformed asset', async () => {
    const adapter = new CoinCapAdapter();

    respond([rawAsset('bad-one', { priceUsd: null })]);
    await adapter.listAssets({ limit: 10 });
    respond([rawAsset('bad-one', { priceUsd: null }), rawAsset('bad-two', { symbol: 7 })]);
    await adapter.listAssets({ limit: 11 });

    expect(errorSpy.mock.calls.map((call) => call[1].droppedAsset)).toEqual(['bad-one', 'bad-two']);
  });
});
