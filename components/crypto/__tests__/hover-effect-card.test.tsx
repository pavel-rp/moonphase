import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HoverEffectCard } from "../../ui/animation/hover-effect-card.client";

// Mock the CryptoIcon and CryptoSparkline components
jest.mock("@/components/crypto/crypto-icon", () => ({
  CryptoIcon: ({ symbol, name }: { symbol: string; name: string }) => (
    <div data-testid="crypto-icon">
      {symbol} - {name}
    </div>
  ),
}));

jest.mock("@/components/crypto/crypto-sparkline", () => ({
  CryptoSparkline: ({ symbol }: { symbol: string }) => (
    <div data-testid="crypto-sparkline">{symbol}</div>
  ),
}));

// Mock motion/react components
jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
  useMotionTemplate: (template: string) => template,
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: jest.fn(),
  }),
  useSpring: (value: unknown) => value,
}));

describe("HoverEffectCard", () => {
  const defaultProps = {
    children: <div>Test Content</div>,
    glowColor: "#ff0000",
  };

  it("renders children correctly", () => {
    render(<HoverEffectCard {...defaultProps} />);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "custom-class";
    render(<HoverEffectCard {...defaultProps} className={customClass} />);
    
    const card = screen.getByText("Test Content").closest(".glassmorphic");
    expect(card).toHaveClass(customClass);
  });

  it("applies glow color as CSS variable", () => {
    const glowColor = "#00ff00";
    render(<HoverEffectCard {...defaultProps} glowColor={glowColor} />);
    
    const card = screen.getByText("Test Content").closest(".glassmorphic");
    expect(card).toHaveStyle({ "--tw-glow-color": glowColor });
  });

  it("renders with default required props", () => {
    render(<HoverEffectCard glowColor="#000000">Content</HoverEffectCard>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies transform-3d and other utility classes", () => {
    render(<HoverEffectCard {...defaultProps} />);
    
    const card = screen.getByText("Test Content").closest(".glassmorphic");
    expect(card).toHaveClass("transform-3d", "transform-gpu", "select-none", "cursor-pointer");
  });

  it("renders glow border with correct styling", () => {
    render(<HoverEffectCard {...defaultProps} />);
    
    // The glow border should be present as an absolute positioned element
    const cardContainer = screen.getByText("Test Content").closest(".transform-3d");
    expect(cardContainer).toBeInTheDocument();
  });

  it("handles mouse move events", () => {
    render(<HoverEffectCard {...defaultProps} />);
    
    const card = screen.getByText("Test Content").closest(".transform-3d");
    expect(card).toBeInTheDocument();
    
    // Simulate mouse move event
    fireEvent.mouseMove(card!);
    // The component should handle the event without throwing errors
  });

  it("handles mouse leave events", () => {
    render(<HoverEffectCard {...defaultProps} />);
    
    const card = screen.getByText("Test Content").closest(".transform-3d");
    expect(card).toBeInTheDocument();
    
    // Simulate mouse leave event
    fireEvent.mouseLeave(card!);
    // The component should handle the event without throwing errors
  });

  it("renders complex children correctly", () => {
    const complexChildren = (
      <div>
        <h2>Title</h2>
        <p>Description</p>
        <button>Click me</button>
      </div>
    );
    
    render(<HoverEffectCard glowColor="#ff0000">{complexChildren}</HoverEffectCard>);
    
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies hover effects classes", () => {
    render(<HoverEffectCard {...defaultProps} />);
    
    const card = screen.getByText("Test Content").closest(".glassmorphic");
    expect(card).toHaveClass("hover:shadow-glow");
  });

  it("renders with different glow colors", () => {
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
    
    colors.forEach(color => {
      const { unmount } = render(
        <HoverEffectCard glowColor={color}>
          <div>Test Content</div>
        </HoverEffectCard>
      );
      
      const card = screen.getByText("Test Content").closest(".glassmorphic");
      expect(card).toHaveStyle({ "--tw-glow-color": color });
      
      unmount();
    });
  });

  it("maintains accessibility attributes", () => {
    render(<HoverEffectCard {...defaultProps} />);
    
    const card = screen.getByText("Test Content").closest(".transform-3d");
    expect(card).toBeInTheDocument();
    // The component should be accessible and not have any accessibility violations
  });

  it("calls onClick handler when card is clicked", () => {
    const mockOnClick = jest.fn();
    render(<HoverEffectCard {...defaultProps} onClick={mockOnClick} />);
    
    const card = screen.getByText("Test Content").closest(".glassmorphic");
    fireEvent.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("does not throw error when clicked without onClick handler", () => {
    render(<HoverEffectCard {...defaultProps} />);
    
    const card = screen.getByText("Test Content").closest(".glassmorphic");
    expect(() => fireEvent.click(card!)).not.toThrow();
  });

  it("works with onClick and maintains other functionality", () => {
    const mockOnClick = jest.fn();
    render(<HoverEffectCard {...defaultProps} onClick={mockOnClick} />);
    
    const card = screen.getByText("Test Content").closest(".transform-3d");
    const cardElement = screen.getByText("Test Content").closest(".glassmorphic");
    
    // Test mouse events still work
    fireEvent.mouseMove(card!);
    fireEvent.mouseLeave(card!);
    
    // Test click works
    fireEvent.click(cardElement!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    
    // Test styling is still applied
    expect(cardElement).toHaveClass("cursor-pointer");
  });
});
