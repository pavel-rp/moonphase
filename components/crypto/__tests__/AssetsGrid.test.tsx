import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssetsGrid, { AssetsGridContent } from "../grid/assets-grid";

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

jest.mock("@/components/ui/grid", () => ({
  Grid: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => (
    <div data-testid="grid" className={className}>
      {children}
    </div>
  ),
  GridItem: ({
    children,
    span,
  }: {
    children: React.ReactNode;
    span?: number;
  }) => (
    <div data-testid="grid-item" data-span={span}>
      {children}
    </div>
  ),
}));

// Mock the fetchAssets function
jest.mock("@/lib/data/assets", () => ({
  fetchAssets: jest.fn(),
}));

import { fetchAssets } from "@/lib/data/assets";
const mockFetchAssets = fetchAssets as jest.MockedFunction<typeof fetchAssets>;

describe("AssetsGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle empty assets array", async () => {
    mockFetchAssets.mockResolvedValue([]);

    const component = await AssetsGridContent();
    render(component);

    // Should render grid but no cards  
    expect(screen.getByTestId("grid")).toBeInTheDocument();
    expect(screen.queryByTestId("crypto-card-clickable")).not.toBeInTheDocument();
  });

  it("should render shimmer grid when loading", () => {
    // This test checks the Suspense fallback behavior
    render(<AssetsGrid />);
    
    expect(screen.getByTestId("shimmer-grid")).toBeInTheDocument();
    expect(screen.getByTestId("shimmer-grid")).toHaveAttribute("data-size", "15");
  });

  it("should render main structure", () => {
    render(<AssetsGrid />);
    
    // Should render the main container
    expect(screen.getByTestId("shimmer-grid")).toBeInTheDocument();
  });
});
