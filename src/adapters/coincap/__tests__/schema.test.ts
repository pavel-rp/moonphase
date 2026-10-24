/** @jest-environment node */

import { ListAssetsResponseSchema } from '../schema';

function rawAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: 'bitcoin',
    rank: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    supply: '19000000',
    maxSupply: '21000000',
    marketCapUsd: '800000000000',
    volumeUsd24Hr: '25000000000',
    priceUsd: '42000.5',
    changePercent24Hr: '2.5',
    vwap24Hr: '41500',
    explorer: 'https://blockchair.com/bitcoin',
    ...overrides,
  };
}

describe('ListAssetsResponseSchema', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => logSpy.mockRestore());

  it('parses numeric strings into numbers', () => {
    const { data } = ListAssetsResponseSchema.parse({ data: [rawAsset()] });

    expect(data[0]).toMatchObject({
      rank: 1,
      priceUsd: 42000.5,
      changePercent24Hr: 2.5,
      maxSupply: 21000000,
    });
  });

  it('reads null metrics as 0 and a null 24h change as null instead of failing the list', () => {
    const { data } = ListAssetsResponseSchema.parse({
      data: [
        rawAsset({
          supply: null,
          marketCapUsd: null,
          volumeUsd24Hr: null,
          changePercent24Hr: null,
          vwap24Hr: null,
        }),
      ],
    });

    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      supply: 0,
      marketCapUsd: 0,
      volumeUsd24Hr: 0,
      changePercent24Hr: null,
      vwap24Hr: 0,
    });
  });

  it('drops a malformed asset and keeps the rest', () => {
    const { data, dropped } = ListAssetsResponseSchema.parse({
      data: [
        rawAsset(),
        rawAsset({ id: 'broken', symbol: 'BRK', priceUsd: null }),
        rawAsset({ id: 'ethereum', symbol: 'ETH' }),
      ],
    });

    expect(data.map((a) => a.symbol)).toEqual(['BTC', 'ETH']);
    expect(dropped.map((d) => d.id)).toEqual(['broken']);
    // Logging is the adapter's job: parsing stays free of side effects.
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('still rejects a response without a data array', () => {
    expect(() => ListAssetsResponseSchema.parse({ error: 'nope' })).toThrow();
  });
});
