import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CryptoCardClickable from "../card/crypto-card-clickable";
import { Asset } from "@/lib/data/assets";

// Mock useRouter
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock HoverEffectCard
jest.mock("../../ui/animation/hover-effect-card.client", () => ({
  HoverEffectCard: ({ children, onClick, glowColor }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    glowColor: string;
  }) => (
    <div 
      data-testid="hover-effect-card"
      data-glow-color={glowColor}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {children}
    </div>
  ),
}));

// Mock UI helpers
jest.mock("@/lib/utils/ui-helpers", () => ({
  getPriceMovementColorVar: (changePercent: number, variation: number) => 
    `var(--color-${changePercent > 0 ? 'green' : changePercent < 0 ? 'red' : 'white'}-${variation})`,
}));

describe("CryptoCardClickable", () => {
  const mockAsset: Asset = {
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

  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders children correctly", () => {
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Test Content</div>
      </CryptoCardClickable>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByTestId("hover-effect-card")).toBeInTheDocument();
  });

  it("navigates to correct symbol detail page when clicked", () => {
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    const card = screen.getByTestId("hover-effect-card");
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/details/btc", { scroll: false });
  });

  it("handles symbols with different cases correctly", () => {
    const assetWithMixedCase = { ...mockAsset, symbol: "BtC" };
    render(
      <CryptoCardClickable {...assetWithMixedCase}>
        <div>Mixed Case Symbol</div>
      </CryptoCardClickable>
    );

    const card = screen.getByTestId("hover-effect-card");
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith("/details/btc", { scroll: false });
  });

  it("passes correct glow color based on price change", () => {
    const positiveChangeAsset = { ...mockAsset, changePercent24Hr: 5.0 };
    const { rerender } = render(
      <CryptoCardClickable {...positiveChangeAsset}>
        <div>Positive Change</div>
      </CryptoCardClickable>
    );

    expect(screen.getByTestId("hover-effect-card")).toHaveAttribute(
      "data-glow-color",
      "var(--color-green-300)"
    );

    const negativeChangeAsset = { ...mockAsset, changePercent24Hr: -2.5 };
    rerender(
      <CryptoCardClickable {...negativeChangeAsset}>
        <div>Negative Change</div>
      </CryptoCardClickable>
    );

    expect(screen.getByTestId("hover-effect-card")).toHaveAttribute(
      "data-glow-color",
      "var(--color-red-300)"
    );

    const noChangeAsset = { ...mockAsset, changePercent24Hr: 0 };
    rerender(
      <CryptoCardClickable {...noChangeAsset}>
        <div>No Change</div>
      </CryptoCardClickable>
    );

    expect(screen.getByTestId("hover-effect-card")).toHaveAttribute(
      "data-glow-color",
      "var(--color-white-300)"
    );
  });

  it("renders with different asset properties", () => {
    const ethereumAsset: Asset = {
      id: "ethereum",
      rank: 2,
      symbol: "ETH",
      name: "Ethereum",
      supply: 120000000,
      maxSupply: null,
      marketCapUsd: 300000000000,
      volumeUsd24Hr: 15000000000,
      priceUsd: 2500,
      changePercent24Hr: -1.2,
      vwap24Hr: 2480,
      explorer: "https://etherscan.io",
    };

    render(
      <CryptoCardClickable {...ethereumAsset}>
        <div>Ethereum Card</div>
      </CryptoCardClickable>
    );

    const card = screen.getByTestId("hover-effect-card");
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith("/details/eth", { scroll: false });
    expect(screen.getByTestId("hover-effect-card")).toHaveAttribute(
      "data-glow-color",
      "var(--color-red-300)"
    );
  });

  it("handles edge case symbols correctly", () => {
    const edgeCaseAssets = [
      { ...mockAsset, symbol: "USDT" },
      { ...mockAsset, symbol: "bnb" },
      { ...mockAsset, symbol: "XRP-20" },
    ];

    edgeCaseAssets.forEach((asset, index) => {
      const { unmount } = render(
        <CryptoCardClickable {...asset}>
          <div>Test Asset {index}</div>
        </CryptoCardClickable>
      );

      const card = screen.getByTestId("hover-effect-card");
      fireEvent.click(card);

      expect(mockPush).toHaveBeenCalledWith(`/details/${asset.symbol.toLowerCase()}`, { scroll: false });
      
      unmount();
      mockPush.mockClear();
    });
  });

  it("maintains accessibility", () => {
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Accessible Content</div>
      </CryptoCardClickable>
    );

    const card = screen.getByTestId("hover-effect-card");
    expect(card).toHaveStyle({ cursor: "pointer" });
    expect(card).toBeInTheDocument();
  });

  it("renders complex children correctly", () => {
    const complexChildren = (
      <div>
        <h3>Bitcoin</h3>
        <p>$42,000</p>
        <span>+2.5%</span>
      </div>
    );

    render(
      <CryptoCardClickable {...mockAsset}>
        {complexChildren}
      </CryptoCardClickable>
    );

    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("$42,000")).toBeInTheDocument();
    expect(screen.getByText("+2.5%")).toBeInTheDocument();
  });
});