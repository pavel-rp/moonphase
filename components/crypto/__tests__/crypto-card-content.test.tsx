import { render, screen } from "@testing-library/react";
import CryptoCardContent from "../card/crypto-card-content";
import { Asset } from "@/lib/data/assets";

jest.mock("../crypto-sparkline", () => ({
  CryptoSparkline: () => <div data-testid="crypto-sparkline" />,
}));

jest.mock("../crypto-icon", () => ({
  CryptoIcon: () => <div data-testid="crypto-icon" />,
}));

const asset: Asset = {
  id: "bitcoin",
  rank: 1,
  symbol: "BTC",
  name: "Bitcoin",
  supply: 19000000,
  maxSupply: 21000000,
  marketCapUsd: 800000000000,
  volumeUsd24Hr: 25000000000,
  priceUsd: 42000,
  changePercent24Hr: 2.5,
  vwap24Hr: 41500,
  explorer: "https://blockchair.com/bitcoin",
};

describe("CryptoCardContent", () => {
  it("shows a plus sign on a 24h gain", () => {
    render(<CryptoCardContent {...asset} />);

    expect(screen.getByText("+2.50%")).toBeInTheDocument();
  });

  it("shows a minus sign on a 24h loss", () => {
    render(<CryptoCardContent {...asset} changePercent24Hr={-3.1} />);

    expect(screen.getByText("-3.10%")).toBeInTheDocument();
  });
});
