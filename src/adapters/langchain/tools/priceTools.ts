import { tool } from "langchain";
import { z } from "zod";
import { Candlestick } from "@/ports/BinancePort";

export interface PriceToolDeps {
  getPriceHistory: (params: { symbol: string; limit?: number }) => Promise<Candlestick[]>;
  getVWAP: (symbol: string) => Promise<number>;
}

/**
 * Handles errors from price data fetching and returns a structured error response.
 * @param error - The error object caught during execution
 * @param symbol - The cryptocurrency symbol being queried
 * @param operation - Description of the operation that failed (e.g., "fetch price history")
 * @returns JSON stringified error object with meaningful message
 */
function handlePriceToolError(error: unknown, symbol: string, operation: string): string {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return JSON.stringify({
      error: `Symbol "${symbol}" not found on Binance. Please verify the symbol format (e.g., "BTCUSDT").`,
    });
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return JSON.stringify({
      error: 'Rate limit exceeded. Please wait a moment before trying again.',
    });
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
    return JSON.stringify({
      error: 'Unable to connect to Binance API. The service may be temporarily unavailable.',
    });
  }

  return JSON.stringify({
    error: `Failed to ${operation} for "${symbol}": ${errorMessage}`,
  });
}

/**
 * Validates that a symbol parameter is a non-empty string.
 * @param symbol - The symbol to validate
 * @returns JSON stringified error object if invalid, null if valid
 */
function validateSymbol(symbol: unknown): string | null {
  if (!symbol || typeof symbol !== 'string') {
    return JSON.stringify({
      error: 'Invalid symbol parameter. Symbol must be a non-empty string (e.g., "BTCUSDT").',
    });
  }
  return null;
}

export function createPriceTools(deps: PriceToolDeps) {
  const getPriceHistoryTool = tool(
    async ({ symbol, limit }: { symbol: string; limit?: number }) => {
      try {
        const validationError = validateSymbol(symbol);
        if (validationError) {
          return validationError;
        }

        const candles = await deps.getPriceHistory({ symbol, limit });

        if (!candles || candles.length === 0) {
          return JSON.stringify({
            error: `No price history found for symbol "${symbol}". The symbol may not exist or may not be available on Binance.`,
          });
        }

        return JSON.stringify({
          success: true,
          symbol,
          count: candles.length,
          data: candles,
        });
      } catch (error) {
        return handlePriceToolError(error, symbol, 'fetch price history');
      }
    },
    {
      name: "get_price_history",
      description: "Get recent price and market data for a cryptocurrency symbol",
      schema: z.object({
        symbol: z.string().describe("The crypto symbol (e.g. BTCUSDT)."),
        limit: z.number().describe("The number of candles to return.").optional(),
      }),
    }
  );

  const getVWAPTool = tool(
    async ({ symbol }: { symbol: string }) => {
      try {
        const validationError = validateSymbol(symbol);
        if (validationError) {
          return validationError;
        }

        const vwap = await deps.getVWAP(symbol);

        if (vwap === null || vwap === undefined || isNaN(vwap)) {
          return JSON.stringify({
            error: `No VWAP data found for symbol "${symbol}". The symbol may not exist or may not be available on Binance.`,
          });
        }

        return JSON.stringify({
          success: true,
          symbol,
          vwap,
        });
      } catch (error) {
        return handlePriceToolError(error, symbol, 'fetch VWAP');
      }
    },
    {
      name: "get_vwap",
      description:
        "Get the 24-hour volume-weighted average price for a cryptocurrency symbol",
      schema: z.object({
        symbol: z.string().describe("The crypto symbol (e.g. BTCUSDT)."),
      }),
    });

  return { getPriceHistoryTool, getVWAPTool };
}

export type PriceTools = ReturnType<typeof createPriceTools>;
