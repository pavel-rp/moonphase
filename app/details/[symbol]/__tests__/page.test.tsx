import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SymbolDetailsPage from "../page";
import { Asset } from "@/lib/data/assets";

// Mock Next.js components
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("notFound");
  }),
}));

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="back-link">
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock the data fetching
jest.mock("@/lib/data/assets");

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className, variant, size }: { 
    children: React.ReactNode; 
    className?: string;
    variant?: string;
    size?: string;
  }) => (
    <button 
      data-testid="button" 
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

// Mock crypto components
jest.mock("@/components/crypto/crypto-icon", () => ({
  CryptoIcon: ({ symbol, name, size }: { symbol: string; name: string; size: number }) => (
    <div data-testid="crypto-icon" data-symbol={symbol} data-name={name} data-size={size}>
      {symbol} Icon
    </div>
  ),
}));

jest.mock("@/components/crypto/crypto-sparkline", () => ({
  CryptoSparkline: ({ symbol }: { symbol: string }) => (
    <div data-testid="crypto-sparkline" data-symbol={symbol}>
      Sparkline for {symbol}
    </div>
  ),
}));

// Mock utility functions
jest.mock("@/lib/utils/numbers", () => ({
  formatNumber: (num: number) => num.toLocaleString(),
  formatPercent: (num: number) => `${num.toFixed(2)}%`,
  prettifyNumber: (num: number) => `${(num / 1000000).toFixed(1)}M`,
}));

jest.mock("@/lib/utils/ui-helpers", () => ({
  getPriceMovementTextColorClass: (changePercent: number) => 
    changePercent > 0 ? "text-green-700" : changePercent < 0 ? "text-red-700" : "text-white-700",
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  ChevronLeft: ({ className }: { className?: string }) => (
    <div data-testid="chevron-left" className={className}>←</div>
  ),
}));

import { notFound } from "next/navigation";
import { fetchAssets } from "@/lib/data/assets";

const mockFetchAssets = fetchAssets as jest.MockedFunction<typeof fetchAssets>;

describe("SymbolDetailsPage", () => {
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
    jest.clearAllMocks();
  });

  it("renders asset details correctly when asset is found", async () => {
    mockFetchAssets.mockResolvedValue([mockAsset]);
    
    const params = Promise.resolve({ symbol: "btc" });
    const component = await SymbolDetailsPage({ params });
    render(component);

    // Check header section
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByTestId("crypto-icon")).toBeInTheDocument();

    // Check price section
    expect(screen.getByText("Price Information")).toBeInTheDocument();
    expect(screen.getByText("2.50%")).toBeInTheDocument();
    expect(screen.getByTestId("crypto-sparkline")).toBeInTheDocument();

    // Check market data section
    expect(screen.getByText("Market Data")).toBeInTheDocument();
    expect(screen.getByText("Market Cap")).toBeInTheDocument();
    expect(screen.getByText("24h Volume")).toBeInTheDocument();
    expect(screen.getByText("VWAP (24h)")).toBeInTheDocument();
    expect(screen.getByText("Circulating Supply")).toBeInTheDocument();
    expect(screen.getByText("Max Supply")).toBeInTheDocument();

    // Check AI Analysis section
    expect(screen.getByText("AI Analysis")).toBeInTheDocument();
    expect(screen.getByText("Generate AI Analysis")).toBeInTheDocument();

  });

  it("calls notFound when asset is not found", async () => {
    mockFetchAssets.mockResolvedValue([]);
    
    const params = Promise.resolve({ symbol: "nonexistent" });
    
    // This should call notFound() and not return a component
    await expect(async () => {
      await SymbolDetailsPage({ params });
    }).rejects.toThrow();

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("handles case-insensitive symbol matching", async () => {
    mockFetchAssets.mockResolvedValue([mockAsset]);
    
    const params = Promise.resolve({ symbol: "BTC" });
    const component = await SymbolDetailsPage({ params });
    render(component);

    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("handles asset with null max supply", async () => {
    const assetWithNullMaxSupply = { ...mockAsset, maxSupply: null };
    mockFetchAssets.mockResolvedValue([assetWithNullMaxSupply]);
    
    const params = Promise.resolve({ symbol: "btc" });
    const component = await SymbolDetailsPage({ params });
    render(component);

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders explorer link correctly", async () => {
    mockFetchAssets.mockResolvedValue([mockAsset]);
    
    const params = Promise.resolve({ symbol: "btc" });
    const component = await SymbolDetailsPage({ params });
    render(component);

    const explorerLink = screen.getByText("View on Explorer");
    expect(explorerLink).toBeInTheDocument();
    expect(explorerLink.closest("a")).toHaveAttribute("href", mockAsset.explorer);
    expect(explorerLink.closest("a")).toHaveAttribute("target", "_blank");
    expect(explorerLink.closest("a")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("handles different asset ranks", async () => {
    const ethereumAsset: Asset = {
      ...mockAsset,
      id: "ethereum",
      rank: 2,
      symbol: "ETH",
      name: "Ethereum",
    };
    mockFetchAssets.mockResolvedValue([ethereumAsset]);
    
    const params = Promise.resolve({ symbol: "eth" });
    const component = await SymbolDetailsPage({ params });
    render(component);

    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
  });

  it("handles fetch errors gracefully", async () => {
    mockFetchAssets.mockRejectedValue(new Error("API Error"));
    
    const params = Promise.resolve({ symbol: "btc" });
    
    // This should call notFound() due to the error
    await expect(async () => {
      await SymbolDetailsPage({ params });
    }).rejects.toThrow();

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("renders all required UI components", async () => {
    mockFetchAssets.mockResolvedValue([mockAsset]);
    
    const params = Promise.resolve({ symbol: "btc" });
    const component = await SymbolDetailsPage({ params });
    render(component);

    // Check that all major sections are rendered
    expect(screen.getAllByTestId("card")).toHaveLength(4); // Header, Price, Market Data, AI Analysis
    expect(screen.getByTestId("crypto-icon")).toBeInTheDocument();
    expect(screen.getByTestId("crypto-sparkline")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });
});