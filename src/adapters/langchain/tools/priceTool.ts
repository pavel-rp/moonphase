import { getMarketData } from "@/usecases/getMarketData";
import { z } from "zod";
import { tool } from "langchain/core/tools";

const priceTool = tool(
    async ({ symbol }: { symbol: string }) => {
      const data = await getMarketData(deps, symbol);
      return JSON.stringify(data);
    },
    {
      name: "fetch_price_data",
      description: "Fetch recent price and market data for a cryptocurrency symbol",
      schema: z.object({ symbol: z.string().describe("Crypto symbol (e.g., BTC, ETH)") })
    }
  );