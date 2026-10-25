import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CryptoCardClickable from "../card/crypto-card-clickable";
import { Asset } from "@/lib/data/assets";

// Render next/link as a plain anchor (exposing its routing props) and stop
// jsdom's unimplemented navigation on click.
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    onClick,
    scroll,
    prefetch,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    scroll?: boolean;
    prefetch?: boolean;
    className?: string;
  }) => (
    <a
      href={href}
      className={className}
      data-scroll={String(scroll)}
      data-prefetch={String(prefetch)}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
      }}
    >
      {children}
    </a>
  ),
}));

// Mock HoverEffectCard
jest.mock("../../ui/animation/hover-effect-card.client", () => ({
  HoverEffectCard: ({ children, glowColor }: {
    children: React.ReactNode;
    glowColor: string;
  }) => (
    <div
      data-testid="hover-effect-card"
      data-glow-color={glowColor}
      style={{ cursor: "pointer" }}
    >
      {children}
    </div>
  ),
}));

// Mock LoadingRings
jest.mock("../../ui/animation/loading-rings.client", () => ({
  LoadingRings: ({ color }: { color: string }) => (
    <div data-testid="loading-rings" data-color={color} />
  ),
}));

// Mock UI helpers
jest.mock("@/lib/utils/ui-helpers", () => ({
  getPriceMovementColorVar: (changePercent: number, variation: number) =>
    `var(--color-${changePercent > 0 ? 'green' : changePercent < 0 ? 'red' : 'slate'}-${variation})`,
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

  afterEach(() => {
    jest.useRealTimers();
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

  it("links to the symbol detail page without scroll reset or prefetch", () => {
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/details/btc");
    expect(link).toHaveAttribute("data-scroll", "false");
    expect(link).toHaveAttribute("data-prefetch", "false");
    expect(link).toContainElement(screen.getByTestId("hover-effect-card"));
  });

  it("handles symbols with different cases correctly", () => {
    const assetWithMixedCase = { ...mockAsset, symbol: "BtC" };
    render(
      <CryptoCardClickable {...assetWithMixedCase}>
        <div>Mixed Case Symbol</div>
      </CryptoCardClickable>
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/details/btc");
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
      "var(--color-slate-300)"
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

    expect(screen.getByRole("link")).toHaveAttribute("href", "/details/eth");
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

      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        `/details/${asset.symbol.toLowerCase()}`
      );

      unmount();
    });
  });

  it("is reachable by keyboard as a link", () => {
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Accessible Content</div>
      </CryptoCardClickable>
    );

    const link = screen.getByRole("link", { name: /accessible content/i });
    link.focus();
    expect(link).toHaveFocus();
  });

  it("shows the loading rings shortly after a plain click", () => {
    jest.useFakeTimers();
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    fireEvent.click(screen.getByRole("link"));
    expect(screen.queryByTestId("loading-rings")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("loading-rings")).toBeInTheDocument();
  });

  it("colors the loading rings with the same CSS variable as the glow", () => {
    jest.useFakeTimers();
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    fireEvent.click(screen.getByRole("link"));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("loading-rings")).toHaveAttribute(
      "data-color",
      "var(--color-green-300)"
    );
  });

  const pageshow = (persisted: boolean) =>
    Object.assign(new Event("pageshow"), { persisted });

  it.each([
    ["popstate", () => new Event("popstate")],
    ["back/forward-cache pageshow", () => pageshow(true)],
  ])("hides the loading rings when the page stays after a %s event", (_name, makeEvent) => {
    jest.useFakeTimers();
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    fireEvent.click(screen.getByRole("link"));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("loading-rings")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(makeEvent());
    });
    expect(screen.queryByTestId("loading-rings")).not.toBeInTheDocument();
  });

  it("keeps the loading rings on the first-load pageshow", () => {
    jest.useFakeTimers();
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    // A slow first load can fire pageshow after the click, mid-navigation.
    fireEvent.click(screen.getByRole("link"));
    act(() => {
      window.dispatchEvent(pageshow(false));
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("loading-rings")).toBeInTheDocument();
  });

  it("cancels a pending loading-rings timer on popstate", () => {
    jest.useFakeTimers();
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    fireEvent.click(screen.getByRole("link"));
    act(() => {
      window.dispatchEvent(new Event("popstate"));
      jest.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId("loading-rings")).not.toBeInTheDocument();
  });

  it("does not show the loading rings for a modified (new-tab) click", () => {
    jest.useFakeTimers();
    render(
      <CryptoCardClickable {...mockAsset}>
        <div>Bitcoin Card</div>
      </CryptoCardClickable>
    );

    fireEvent.click(screen.getByRole("link"), { metaKey: true });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId("loading-rings")).not.toBeInTheDocument();
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