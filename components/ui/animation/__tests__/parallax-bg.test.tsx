import React from "react";
import { render, screen } from "@testing-library/react";
import ParallaxBg from "../parallax-bg";

const TILE_HEIGHT = 1024;

let mockReduceMotion = false;
let mockScrollTransform: ((v: number) => number) | undefined;
const mockScrollY = { kind: "scrollY" };

// Render motion.div as a plain div, recording whether `y` is a live value.
jest.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      style,
      "data-testid": testId,
    }: {
      children?: React.ReactNode;
      style?: Record<string, unknown>;
      "data-testid"?: string;
    }) => {
      const { y, ...css } = style ?? {};
      const yKind = y === undefined ? "none" : typeof y === "object" ? "motion-value" : String(y);
      return (
        <div data-testid={testId} data-y={yKind} style={css as React.CSSProperties}>
          {children}
        </div>
      );
    },
  },
  useReducedMotion: () => mockReduceMotion,
  useScroll: () => ({ scrollY: mockScrollY }),
  useTransform: (_source: unknown, transform: (v: number) => number) => {
    mockScrollTransform = transform;
    return { kind: "motion-value" };
  },
}));

jest.mock("next/navigation", () => ({
  useSelectedLayoutSegment: () => null,
}));

describe("ParallaxBg", () => {
  afterEach(() => {
    mockReduceMotion = false;
  });

  it("scrolls the background layer with a transform", () => {
    render(<ParallaxBg />);

    const layer = screen.getByTestId("parallax-layer");
    expect(layer).toHaveAttribute("data-y", "motion-value");
    expect(layer.style.height).toBe(`calc(100% + ${TILE_HEIGHT}px)`);
  });

  it("keeps the shift within one tile, aligned with the full scroll offset", () => {
    render(<ParallaxBg />);
    const transform = mockScrollTransform!;

    for (const scroll of [0, 100, 1463, 2000, 12345, -50]) {
      const shift = transform(scroll);
      expect(shift).toBeLessThanOrEqual(0);
      expect(shift).toBeGreaterThan(-TILE_HEIGHT);

      // The tiles line up where they would at background-position-y = -0.7 * scroll.
      const misalignment = (((shift + 0.7 * scroll) % TILE_HEIGHT) + TILE_HEIGHT) % TILE_HEIGHT;
      expect(Math.min(misalignment, TILE_HEIGHT - misalignment)).toBeCloseTo(0, 6);
    }
  });

  it("shows a static background instead of nothing under reduced motion", () => {
    mockReduceMotion = true;
    render(<ParallaxBg />);

    const layer = screen.getByTestId("parallax-layer");
    expect(layer).toHaveAttribute("data-y", "0");
    expect(layer.style.backgroundImage).toBe('url("/moon-bg.jpg")');
  });
});
