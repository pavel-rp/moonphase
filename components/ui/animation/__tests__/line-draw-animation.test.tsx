import React, { Ref } from "react";
import { act, render, screen } from "@testing-library/react";
import { withLineDrawAnimation } from "../line-draw-animation.client";

const mockFromTo = jest.fn();
const mockMatchMediaAdd = jest.fn();
let mockGsapCallback: (() => void) | undefined;
let mockGsapConfig: { scope?: unknown; dependencies?: unknown[] } | undefined;

jest.mock("gsap", () => ({
  __esModule: true,
  gsap: {
    registerPlugin: jest.fn(),
    fromTo: (...args: unknown[]) => mockFromTo(...args),
    matchMedia: () => ({ add: (...args: unknown[]) => mockMatchMediaAdd(...args) }),
  },
}));

jest.mock("@gsap/react", () => ({
  __esModule: true,
  useGSAP: (callback: () => void, config: { scope?: unknown; dependencies?: unknown[] }) => {
    mockGsapCallback = callback;
    mockGsapConfig = config;
  },
}));

type LineProps = {
  label: string;
  className?: string;
  lineRef?: Ref<SVGPolylineElement>;
  containerRef?: Ref<HTMLDivElement>;
};

function Line({ label, className, lineRef, containerRef }: LineProps) {
  return (
    <div ref={containerRef} data-testid="container" className={className}>
      <svg>
        <polyline ref={lineRef} data-testid="line" points="0,0 1,1" />
      </svg>
      {label}
    </div>
  );
}

const AnimatedLine = withLineDrawAnimation(Line);

// Runs the useGSAP callback, then the matchMedia handler it registered.
function runAnimation() {
  act(() => mockGsapCallback!());
  const [, handler] = mockMatchMediaAdd.mock.calls[0] as [string, () => void];
  act(() => handler());
}

describe("withLineDrawAnimation", () => {
  beforeEach(() => {
    mockFromTo.mockClear();
    mockMatchMediaAdd.mockClear();
    mockGsapCallback = undefined;
    mockGsapConfig = undefined;
  });

  it("passes props through and reveals the component after mount", () => {
    render(<AnimatedLine label="BTC" className="text-green-700" />);

    const container = screen.getByTestId("container");
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(container).toHaveClass("text-green-700", "opacity-100");
    expect(container).not.toHaveClass("opacity-0");
  });

  it("animates once on mount, scoped to the container", () => {
    render(<AnimatedLine label="BTC" />);

    expect(mockGsapConfig?.dependencies).toEqual([]);
    expect(mockGsapConfig?.scope).toEqual({ current: screen.getByTestId("container") });
  });

  it("animates only when the user has no reduced-motion preference", () => {
    render(<AnimatedLine label="BTC" />);

    act(() => mockGsapCallback!());

    expect(mockMatchMediaAdd).toHaveBeenCalledWith(
      "(prefers-reduced-motion: no-preference)",
      expect.any(Function)
    );
    // Nothing runs until matchMedia says the query matches.
    expect(mockFromTo).not.toHaveBeenCalled();
  });

  it("draws the line and fades in the container", () => {
    render(<AnimatedLine label="BTC" />);

    runAnimation();

    expect(mockFromTo).toHaveBeenCalledTimes(2);
    expect(mockFromTo).toHaveBeenCalledWith(
      screen.getByTestId("line"),
      { drawSVG: "0%" },
      expect.objectContaining({ drawSVG: "100%" })
    );
    expect(mockFromTo).toHaveBeenCalledWith(
      screen.getByTestId("container"),
      { opacity: 0 },
      expect.objectContaining({ opacity: 1 })
    );
  });
});
