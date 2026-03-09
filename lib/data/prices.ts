import { getPriceHistory, getVWAP } from '@/usecases/getPrices';
import { pricesDeps } from '@/compositionRoot';
import { toBinancePair } from '@/lib/symbolMeta';

export async function fetchPrices(symbol: string) {
  const pair = toBinancePair(symbol);
  const candles = await getPriceHistory(
    pricesDeps,
    { symbol: pair, limit: 60 },
  );
  return candles.map((c) => c.close);
}

export async function fetchVWAP(symbol: string) {
  const pair = toBinancePair(symbol);
  return getVWAP(pricesDeps, pair);
}
