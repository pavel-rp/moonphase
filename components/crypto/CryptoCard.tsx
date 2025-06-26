import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  formatNumber,
  formatPercent,
  prettifyNumber,
} from "@/lib/utils/numbers";
import { CryptoIcon } from "./CryptoIcon";
import { Asset } from "@/lib/data/assets";

export function CryptoCard({
  name,
  symbol,
  priceUsd,
  changePercent24Hr,
  marketCapUsd,
  volumeUsd24Hr,
  supply,
  maxSupply,
}: Asset) {
  let shadowClass = "text-shadow-[0_0_4px_rgb(255_255_255_/_0.5)]";
  shadowClass += changePercent24Hr >= 0 ? " text-green-700" : " text-red-700";
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
        <div
          className={`flex w-full items-center justify-between space-x-2 ${shadowClass}`}
        >
          <span className={`text-2xl font-bold ${shadowClass}`}>
            ${formatNumber(priceUsd)}
          </span>
          <span className="text-sm">{formatPercent(changePercent24Hr)}</span>
        </div>
        <div className="mt-4 text-sm">
          <p>Market Cap: ${prettifyNumber(marketCapUsd)}</p>
          <p>24h Volume: ${prettifyNumber(volumeUsd24Hr)}</p>
          <p>
            Supply: {prettifyNumber(supply)} {symbol}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
