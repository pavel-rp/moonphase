import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatNumber, prettifyNumber } from "@/lib/numbers";
import { CryptoIcon } from "./CryptoIcon";

export type CryptoCardProps = {
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
};

export function CryptoCard({
  name,
  symbol,
  price,
  priceChange24h,
  marketCap,
  volume24h,
  circulatingSupply,
}: CryptoCardProps) {
  let shadowClass = "text-shadow-[0_0_4px_rgb(255_255_255_/_0.5)]";
  shadowClass +=
    priceChange24h >= 0 ? " text-green-700" : " text-red-700";
  return (
    <Card className="glassmorphic">
      <CardHeader className="flex items-center justify-between">
        <div className="flex flex-col">
          <CardTitle>{name}</CardTitle>
          <CardDescription>{symbol}</CardDescription>
        </div>
        <CryptoIcon symbol={symbol} size={30} name={name} />
      </CardHeader>
      <CardContent className="flex flex-col items-start">
        <div className={`flex items-center space-x-2 ${shadowClass}`}>
          <span className={`text-2xl font-bold ${shadowClass}`}>
            ${formatNumber(price)}
          </span>
          <span className="text-sm">
            {priceChange24h >= 0 ? "+" : ""}
            {priceChange24h.toFixed(2)}%
          </span>
        </div>
        <div className="mt-4 text-sm">
          <p>Market Cap: ${prettifyNumber(marketCap)}</p>
          <p>24h Volume: ${prettifyNumber(volume24h)}</p>
          <p>
            Circulating Supply: {prettifyNumber(circulatingSupply)} {symbol}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
