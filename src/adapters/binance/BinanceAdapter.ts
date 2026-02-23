import { dedupe, inflightKey } from "@/lib/http/inflight";
import { get } from "./client";
import { KlinesSchema, Ticker24hrSchema } from "./schema";
import type { BinancePort, Candlestick } from "@/ports/BinancePort";
import { handleResponse } from "@/lib/http/handleResponse";

export class BinanceAdapter implements BinancePort {
  async get24HrStats(symbol: string): Promise<number> {
    const key = inflightKey("binance/ticker24hr", { symbol });
    return dedupe(key, async () => {
      const res = await get(
        `/ticker/24hr?symbol=${encodeURIComponent(symbol)}`,
        {
          next: { revalidate: 30 },
        },
      );
      const parsed = await handleResponse(res, Ticker24hrSchema, "Binance API");
      return parsed.weightedAvgPrice;
    });
  }

  async getDailyCandles(
    symbol: string,
    limit?: number,
  ): Promise<Candlestick[]> {
    const key = inflightKey("binance/klines", {
      symbol,
      interval: "1d",
      limit,
    });
    return dedupe(key, async () => {
      const query = new URLSearchParams({ symbol, interval: "1d" });
      if (typeof limit === "number") query.set("limit", String(limit));
      const res = await get(`/klines?${query.toString()}`, {
        next: { revalidate: 60 },
      });
      return handleResponse(res, KlinesSchema, "Binance API");
    });
  }
}
