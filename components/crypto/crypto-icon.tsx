import { getCryptoIconPath, isValidCryptoIcon } from "@/lib/utils/crypto-icons";
import Image from "next/image";

export type CryptoIconStyle = "black" | "white" | "color" | "icon";

export interface CryptoIconProps {
  symbol: string;
  size: number;
  name?: string;
  style?: CryptoIconStyle;
  className?: string;
}

export function CryptoIcon({
  symbol,
  size = 30,
  style = "icon",
  name = symbol,
  className,
}: CryptoIconProps) {
  const iconName = symbol.toLowerCase();
  const iconUrl = isValidCryptoIcon(iconName)
    ? getCryptoIconPath(iconName, style)
    : getCryptoIconPath("generic", style);

  return (
    <Image
      src={iconUrl}
      alt={`${name} Logo`}
      width={size}
      height={size}
      className={className}
    />
  );
}