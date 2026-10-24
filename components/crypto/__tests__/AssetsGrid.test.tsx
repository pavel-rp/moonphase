import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AssetsGridContent } from "../grid/assets-grid";
import { fetchAssets } from "@/lib/data/assets";

jest.mock("../card/crypto-card-clickable", () => {
  return function MockCryptoCardClickable({ children }: { children: React.ReactNode }) {
    return <div data-testid="crypto-card-clickable">{children}</div>;
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

jest.mock("@/lib/data/assets", () => ({
  fetchAssets: jest.fn(),
}));

const mockFetchAssets = fetchAssets as jest.MockedFunction<typeof fetchAssets>;

const mockAssets = [
  {
    id: "bitcoin",
    rank: 1,
    symbol: "BTC",
    name: "Bitcoin",
    supply: 19759206,
    maxSupply: 21000000,
    marketCapUsd: 1989079039632.52,
    volumeUsd24Hr: 15692705919.39,
    priceUsd: 100654.39,
    changePercent24Hr: 1.23,
    vwap24Hr: 99887.77,
    explorer: "https://blockchain.info/",
  },
  {
    id: "ethereum",
    rank: 2,
    symbol: "ETH",
    name: "Ethereum",
    supply: 120426315.68,
    maxSupply: null,
    marketCapUsd: 450923847162.12,
    volumeUsd24Hr: 8765432109.88,
    priceUsd: 3742.12,
    changePercent24Hr: -2.35,
    vwap24Hr: 3798.65,
    explorer: "https://etherscan.io/",
  },
];

// The async grid content can't render through Suspense in jsdom, so await it directly.
describe("AssetsGridContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a card per asset, with BTC featured across two columns", async () => {
    mockFetchAssets.mockResolvedValue(mockAssets);

    render(await AssetsGridContent());

    expect(screen.getAllByTestId("crypto-card-clickable")).toHaveLength(2);
    expect(screen.getByText("Bitcoin (BTC)").closest(".md\\:col-span-2")).not.toBeNull();
    expect(screen.getByText("Ethereum (ETH)").closest(".md\\:col-span-2")).toBeNull();
  });

  it("renders no cards for an empty list", async () => {
    mockFetchAssets.mockResolvedValue([]);

    render(await AssetsGridContent());

    expect(screen.queryAllByTestId("crypto-card-clickable")).toHaveLength(0);
  });

  it("shows an error message when assets fail to load", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockFetchAssets.mockRejectedValue(new Error("CoinCap API error 500"));

    render(await AssetsGridContent());

    expect(screen.getByText(/Error loading assets: CoinCap API error 500/)).toBeInTheDocument();
    expect(screen.queryAllByTestId("crypto-card-clickable")).toHaveLength(0);
    errorSpy.mockRestore();
  });
});
