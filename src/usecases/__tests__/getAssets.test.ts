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

/** `length` ranked assets; every `every`-th one (W1, W2, ...) is whitelisted. */
function makeMarket(length: number, every: number): Asset[] {
  return Array.from({ length }, (_, i) =>
    (i + 1) % every === 0 ? asset(i + 1, `W${(i + 1) / every}`) : asset(i + 1, `X${i + 1}`),
  );
}

const whitelisted = (assets: Asset[]) => assets.filter((a) => a.symbol.startsWith('W')).map((a) => a.symbol);

/** 300 ranked assets; every third one is whitelisted. */
const market = makeMarket(300, 3);
const allowedSymbols = whitelisted(market);

function makeDeps(symbols: string[] = allowedSymbols, assets: Asset[] = market) {
  const coinCap: jest.Mocked<CoinCapPort> = {
    listAssets: jest.fn(async ({ limit = 19, offset = 0 } = {}) => assets.slice(offset, offset + limit)),
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

  it('pages without gaps when fewer than 1 in 5 ranks is whitelisted', async () => {
    // 1 in 6: a 5x read of the top 200 ranks holds only 33 of the 40 assets
    // that offset 20 needs, which used to return a short page and skip W34-W40.
    const sparse = makeMarket(600, 6);
    const deps = makeDeps(whitelisted(sparse), sparse);

    const pages = [
      await getAssets(deps, { limit: 20, offset: 0 }),
      await getAssets(deps, { limit: 20, offset: 20 }),
      await getAssets(deps, { limit: 20, offset: 40 }),
    ];

    expect(pages.flatMap(symbols)).toEqual(Array.from({ length: 60 }, (_, i) => `W${i + 1}`));
  });

  it('reads again at full depth when the 5x read leaves a page short', async () => {
    const sparse = makeMarket(600, 6);
    const deps = makeDeps(whitelisted(sparse), sparse);

    await getAssets(deps, { limit: 20, offset: 20 });

    expect(deps.coinCap.listAssets).toHaveBeenNthCalledWith(1, { limit: 200, offset: 0 });
    expect(deps.coinCap.listAssets).toHaveBeenNthCalledWith(2, { limit: COINCAP_MAX_REQUEST_LIMIT, offset: 0 });
  });

  it('does not read again when CoinCap has no more assets', async () => {
    const sparse = makeMarket(150, 6);
    const deps = makeDeps(whitelisted(sparse), sparse);

    const result = await getAssets(deps, { limit: 20, offset: 20 });

    expect(symbols(result)).toEqual(['W21', 'W22', 'W23', 'W24', 'W25']);
    expect(deps.coinCap.listAssets).toHaveBeenCalledTimes(1);
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
