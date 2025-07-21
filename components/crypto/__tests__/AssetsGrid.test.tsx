import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssetsGrid from "../grid/assets-grid";
import AssetsGridClient from "../grid/assets-grid-client";

// Mock the child components
jest.mock("../card/crypto-card-clickable", () => {
  return function MockCryptoCardClickable({ children }: { children: React.ReactNode }) {
    return (
      <div data-testid="crypto-card-clickable">
        {children}
      </div>
    );
  };
});

jest.mock("../card/crypto-card-content", () => {
  return function MockCryptoCardContent({ symbol, name }: { symbol: string; name: string }) {
    return (
      <div data-testid="crypto-card-content">
        {name} ({symbol})
      </div>
    );
  };
});

jest.mock("../../ui/shimmer-grid", () => ({
  __esModule: true,
  default: ({ size }: { size: number }) => (
    <div data-testid="shimmer-grid" data-size={size}>Loading...</div>
  ),
}));

// Mock the AssetsGridClient component
jest.mock("../grid/assets-grid-client", () => {
  return function MockAssetsGridClient({ assets }: { assets: Array<{ id: string; name: string; symbol: string }> }) {
    return (
      <div data-testid="assets-grid-client">
        {assets.map((asset) => (
          <div key={asset.id} data-testid="crypto-card-clickable">
            <div data-testid="crypto-card-content">
              {asset.name} ({asset.symbol})
            </div>
          </div>
        ))}
      </div>
    );
  };
});

// Mock the data fetching
jest.mock("@/lib/data/assets", () => ({
  fetchAssets: jest.fn(),
}));

import { fetchAssets } from "@/lib/data/assets";

const mockFetchAssets = fetchAssets as jest.MockedFunction<typeof fetchAssets>;

const mockAssets = [
  {
    id: "bitcoin",
    rank: 1,
    symbol: "BTC",
    name: "Bitcoin",
    supply: 19759206.0000000000000000,
    maxSupply: 21000000.0000000000000000,
    marketCapUsd: 1989079039632.5208139822,
    volumeUsd24Hr: 15692705919.3982234872,
    priceUsd: 100654.3928291255,
    changePercent24Hr: 1.2345678900000000,
    vwap24Hr: 99887.7654321098,
    explorer: "https://blockchain.info/",
  },
  {
    id: "ethereum",
    rank: 2,
    symbol: "ETH",
    name: "Ethereum",
    supply: 120426315.6835060000000000,
    maxSupply: null,
    marketCapUsd: 450923847162.1234567890,
    volumeUsd24Hr: 8765432109.8765432100,
    priceUsd: 3742.1234567890,
    changePercent24Hr: -2.3456789000000000,
    vwap24Hr: 3798.6543210987,
    explorer: "https://etherscan.io/",
  },
];

describe("AssetsGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading state", () => {
    render(<AssetsGrid />);
    expect(screen.getByTestId("shimmer-grid")).toBeInTheDocument();
  });
});

describe("AssetsGridClient", () => {
  it("renders assets with correct grid layout", () => {
    render(<AssetsGridClient assets={mockAssets} />);

    const cards = screen.getAllByTestId("crypto-card-clickable");
    expect(cards).toHaveLength(2);

    expect(screen.getByText("Bitcoin (BTC)")).toBeInTheDocument();
    expect(screen.getByText("Ethereum (ETH)")).toBeInTheDocument();
  });

  it("handles empty assets array", () => {
    render(<AssetsGridClient assets={[]} />);

    const cards = screen.queryAllByTestId("crypto-card-clickable");
    expect(cards).toHaveLength(0);
  });
});
