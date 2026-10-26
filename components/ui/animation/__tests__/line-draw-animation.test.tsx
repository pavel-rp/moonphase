import React, { Ref } from "react";
import { act, render, screen } from "@testing-library/react";
import { withLineDrawAnimation } from "../line-draw-animation.client";

type TweenVars = Record<string, unknown> & { onUpdate: () => void; onComplete?: () => void };

const mockTo = jest.fn();
const mockKill = jest.fn();
const mockGetLength = jest.fn();
const mockMatchMediaAdd = jest.fn();
// One callback per component, keyed by its scope ref: with no dependencies,
// useGSAP runs only the first render's callback.
const mockGsapCallbacks = new Map<unknown, () => void>();
let mockGsapConfig: { scope?: unknown; dependencies?: unknown[] } | undefined;

jest.mock("gsap", () => ({
  __esModule: true,
  gsap: {
    registerPlugin: jest.fn(),
    to: (...args: unknown[]) => {
      mockTo(...args);
      return { kill: mockKill };
    },
    matchMedia: () => ({ add: (...args: unknown[]) => mockMatchMediaAdd(...args) }),
  },
}));

jest.mock("gsap/DrawSVGPlugin", () => ({
  __esModule: true,
  DrawSVGPlugin: { getLength: (...args: unknown[]) => mockGetLength(...args) },
}));

jest.mock("@gsap/react", () => ({
  __esModule: true,
  useGSAP: (callback: () => void, config: { scope?: unknown; dependencies?: unknown[] }) => {
    if (!mockGsapCallbacks.has(config.scope)) {
      mockGsapCallbacks.set(config.scope, callback);
    }
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

// Runs each mounted component's useGSAP callback and the matchMedia handler it
// registered, as one commit does. Returns the handlers' revert functions.
function runAnimations() {
  act(() => mockGsapCallbacks.forEach((callback) => callback()));
  const handlers = mockMatchMediaAdd.mock.calls.map(([, handler]) => handler as () => () => void);
  let reverts: Array<() => void> = [];
  act(() => {
    reverts = handlers.map((handler) => handler());
  });
  return reverts;
}

// Lets the batched measure run (it waits for the commit to finish).
async function flushMeasure() {
  await act(async () => {
    await Promise.resolve();
  });
}

// The tweens started on the plain object that holds `prop` (the line's dash or
// the container's opacity).
function tweensOf(prop: "dash" | "opacity") {
  return mockTo.mock.calls
    .filter(([target]) => prop in (target as object))
    .map(([target, vars]) => ({ target: target as Record<string, number>, vars: vars as TweenVars }));
}

describe("withLineDrawAnimation", () => {
  beforeEach(() => {
    mockTo.mockClear();
    mockKill.mockClear();
    mockGetLength.mockReset().mockReturnValue(120);
    mockMatchMediaAdd.mockClear();
    mockGsapCallbacks.clear();
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

  it("animates only when the user has no reduced-motion preference", async () => {
    render(<AnimatedLine label="BTC" />);

    act(() => mockGsapCallbacks.forEach((callback) => callback()));
    await flushMeasure();

    expect(mockMatchMediaAdd).toHaveBeenCalledWith(
      "(prefers-reduced-motion: no-preference)",
      expect.any(Function)
    );
    // Nothing runs until matchMedia says the query matches.
    expect(mockTo).not.toHaveBeenCalled();
  });

  it("fades in the container", () => {
    render(<AnimatedLine label="BTC" />);
    const container = screen.getByTestId("container");

    runAnimations();

    expect(container.style.opacity).toBe("0");
    const [{ target, vars }] = tweensOf("opacity");
    expect(vars).toEqual(expect.objectContaining({ opacity: 1, duration: 0.4, ease: "power1.inOut" }));

    target.opacity = 0.5;
    vars.onUpdate();
    expect(container.style.opacity).toBe("0.5");
  });

  it("draws the line over its measured length, the way DrawSVG writes the dash", async () => {
    render(<AnimatedLine label="BTC" />);
    const line = screen.getByTestId("line");

    runAnimations();
    await flushMeasure();

    expect(mockGetLength).toHaveBeenCalledWith(line);
    expect(line.style.strokeDasharray).toBe("0px,120.1px");
    const [{ target, vars }] = tweensOf("dash");
    expect(vars).toEqual(expect.objectContaining({ dash: 120, duration: 0.8, ease: "power2.out" }));

    target.dash = 30;
    vars.onUpdate();
    expect(line.style.strokeDasharray).toBe("30px,90.1px");

    vars.onComplete!();
    expect(line.style.strokeDasharray).toBe("");
  });

  it("measures every line mounted together before styling any of them", async () => {
    render(
      <>
        <AnimatedLine label="BTC" />
        <AnimatedLine label="ETH" />
      </>
    );
    const lines = screen.getAllByTestId("line");
    const dashesAtMeasure: string[] = [];
    mockGetLength.mockImplementation(() => {
      dashesAtMeasure.push(...lines.map((line) => line.style.strokeDasharray));
      return 120;
    });

    runAnimations();
    // Nothing is measured until the whole commit has run.
    expect(mockGetLength).not.toHaveBeenCalled();
    await flushMeasure();

    expect(mockGetLength).toHaveBeenCalledTimes(2);
    expect(dashesAtMeasure.every((dash) => dash === "")).toBe(true);
    expect(tweensOf("dash")).toHaveLength(2);
  });

  it("doesn't draw a line whose animation was reverted before it was measured", async () => {
    render(<AnimatedLine label="BTC" />);
    const line = screen.getByTestId("line");

    const [revert] = runAnimations();
    act(() => revert());
    await flushMeasure();

    expect(tweensOf("dash")).toHaveLength(0);
    expect(line.style.strokeDasharray).toBe("");
  });

  it("skips a line that left the page before it was measured", async () => {
    const { unmount } = render(<AnimatedLine label="BTC" />);

    runAnimations();
    unmount();
    await flushMeasure();

    expect(mockGetLength).not.toHaveBeenCalled();
    expect(tweensOf("dash")).toHaveLength(0);
  });

  it("stops the draw and shows the whole sparkline when reverted", async () => {
    render(<AnimatedLine label="BTC" />);
    const line = screen.getByTestId("line");
    const container = screen.getByTestId("container");

    const [revert] = runAnimations();
    await flushMeasure();
    act(() => revert());

    expect(mockKill).toHaveBeenCalled();
    expect(line.style.strokeDasharray).toBe("");
    expect(container.style.opacity).toBe("");
  });
});
