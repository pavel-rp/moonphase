/** @jest-environment node */

import { getAssets } from '../getAssets';
import { CoinCapPort } from '@/ports/CoinCapPort';
import { AssetWhitelistPort } from '@/ports/AssetWhitelistPort';
import { Asset } from '@/domain/asset';
import { COINCAP_MAX_REQUEST_LIMIT } from '@/lib/config';

function asset(rank: number, symbol: string): Asset {
  return {
    id: symbol.toLowerCase(),
    rank,
    symbol,
    name: symbol,
    supply: 0,
    maxSupply: null,
    marketCapUsd: 0,
    volumeUsd24Hr: 0,
    priceUsd: 1,
    changePercent24Hr: 0,
    vwap24Hr: 0,
    explorer: '',
  };
}

/** 300 ranked assets; every third one (W1, W2, ...) is whitelisted. */
const market = Array.from({ length: 300 }, (_, i) =>
  i % 3 === 2 ? asset(i + 1, `W${(i + 1) / 3}`) : asset(i + 1, `X${i + 1}`),
);
const allowedSymbols = market.filter((a) => a.symbol.startsWith('W')).map((a) => a.symbol);

function makeDeps(symbols: string[] = allowedSymbols) {
  const coinCap: jest.Mocked<CoinCapPort> = {
    listAssets: jest.fn(async ({ limit = 19, offset = 0 } = {}) => market.slice(offset, offset + limit)),
  };
  const whitelist: AssetWhitelistPort = { listAllowedSymbols: async () => symbols };
  return { coinCap, whitelist };
}

const symbols = (assets: Asset[]) => assets.map((a) => a.symbol);

describe('getAssets', () => {
  it('pages through whitelisted assets without repeats or gaps', async () => {
    const deps = makeDeps();

    const page1 = await getAssets(deps, { limit: 5, offset: 0 });
    const page2 = await getAssets(deps, { limit: 5, offset: 5 });

    expect(symbols(page1)).toEqual(['W1', 'W2', 'W3', 'W4', 'W5']);
    expect(symbols(page2)).toEqual(['W6', 'W7', 'W8', 'W9', 'W10']);
  });

  it('reads from the top of CoinCap with a 5x overfetch', async () => {
    const deps = makeDeps();

    await getAssets(deps, { limit: 19, offset: 0 });
    await getAssets(deps, { limit: 10, offset: 20 });

    expect(deps.coinCap.listAssets).toHaveBeenNthCalledWith(1, { limit: 95, offset: 0 });
    expect(deps.coinCap.listAssets).toHaveBeenNthCalledWith(2, { limit: 150, offset: 0 });
  });

  it('caps the upstream request size for deep offsets', async () => {
    const deps = makeDeps();

    await getAssets(deps, { limit: 100, offset: 1_000_000 });

    expect(deps.coinCap.listAssets).toHaveBeenCalledWith({ limit: COINCAP_MAX_REQUEST_LIMIT, offset: 0 });
  });

  it('matches whitelist symbols case-insensitively', async () => {
    const deps = makeDeps(['w1', 'W2']);

    const result = await getAssets(deps, { limit: 5 });

    expect(symbols(result)).toEqual(['W1', 'W2']);
  });

  it('passes limit and offset straight through without a whitelist', async () => {
    const { coinCap } = makeDeps();

    const result = await getAssets({ coinCap }, { limit: 3, offset: 6 });

    expect(coinCap.listAssets).toHaveBeenCalledWith({ limit: 3, offset: 6 });
    expect(symbols(result)).toEqual(['X7', 'X8', 'W3']);
  });
});
