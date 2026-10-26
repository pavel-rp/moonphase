import React, { Ref, StrictMode } from "react";
import { act, render, screen } from "@testing-library/react";
import { withLineDrawAnimation } from "../line-draw-animation.client";

type TweenOptions = {
  duration: number;
  ease: string;
  onUpdate: (value: number) => void;
  onComplete: () => void;
};

const mockAnimate = jest.fn();
jest.mock("motion/react", () => ({
  animate: (...args: unknown[]) => mockAnimate(...args),
}));

type LineProps = {
  label: string;
  className?: string;
  points?: string;
  lineRef?: Ref<SVGPolylineElement>;
  containerRef?: Ref<HTMLDivElement>;
};

function Line({ label, className, points = "0,0 1,0", lineRef, containerRef }: LineProps) {
  return (
    <div ref={containerRef} data-testid="container" className={className}>
      <svg>
        <polyline ref={lineRef} data-testid="line" points={points} vectorEffect="non-scaling-stroke" />
      </svg>
      {label}
    </div>
  );
}

const AnimatedLine = withLineDrawAnimation(Line);

async function flushMeasure() {
  await act(async () => {
    await Promise.resolve();
  });
}

function animations() {
  return mockAnimate.mock.calls.map(([, , options], i) => ({
    options: options as TweenOptions,
    stop: mockAnimate.mock.results[i].value.stop as jest.Mock,
  }));
}

// jsdom has no SVG geometry API. Exercise the actual measurement against
// explicit points and screen matrices rather than mocking the length result.
const mockScreenCTM = jest.fn();
const mediaListeners = new Set<() => void>();
let matches = true;
const media = {
  get matches() { return matches; },
  addEventListener: jest.fn((_event: string, listener: () => void) => mediaListeners.add(listener)),
  removeEventListener: jest.fn((_event: string, listener: () => void) => mediaListeners.delete(listener)),
};

function setMotionPreference(animate: boolean) {
  act(() => {
    matches = animate;
    mediaListeners.forEach((listener) => listener());
  });
}

describe("withLineDrawAnimation", () => {
  const originalMatchMedia = window.matchMedia;
  const originalPoints = Object.getOwnPropertyDescriptor(SVGElement.prototype, "points");
  const originalCTM = Object.getOwnPropertyDescriptor(SVGElement.prototype, "getScreenCTM");

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, "points", {
      configurable: true,
      get() {
        const values = (this.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number);
        return {
          numberOfItems: values.length / 2,
          getItem: (i: number) => ({ x: values[i * 2], y: values[i * 2 + 1] }),
        };
      },
    });
    Object.defineProperty(SVGElement.prototype, "getScreenCTM", {
      configurable: true,
      value: mockScreenCTM,
    });
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
    if (originalPoints) Object.defineProperty(SVGElement.prototype, "points", originalPoints);
    else Reflect.deleteProperty(SVGElement.prototype, "points");
    if (originalCTM) Object.defineProperty(SVGElement.prototype, "getScreenCTM", originalCTM);
    else Reflect.deleteProperty(SVGElement.prototype, "getScreenCTM");
  });

  beforeEach(() => {
    mockAnimate.mockReset().mockImplementation(() => ({ stop: jest.fn() }));
    mockScreenCTM.mockReset().mockReturnValue({ a: 120, b: 0, c: 0, d: 50 });
    matches = true;
    mediaListeners.clear();
    media.addEventListener.mockClear();
    media.removeEventListener.mockClear();
    window.matchMedia = jest.fn().mockReturnValue(media);
  });

  it("passes props through and reveals the component after mount", async () => {
    render(<AnimatedLine label="BTC" className="text-green-700" />);
    await flushMeasure();

    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByTestId("container")).toHaveClass("text-green-700", "opacity-100");
    expect(screen.getByTestId("container")).not.toHaveClass("opacity-0");
  });

  it("doesn't restart on the opacity class flip or a className change", async () => {
    const { rerender } = render(<AnimatedLine label="BTC" />);
    await flushMeasure();
    rerender(<AnimatedLine label="BTC" className="text-red-700" />);
    await flushMeasure();

    expect(mockAnimate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("container")).toHaveClass("text-red-700");
  });

  it("never animates when loaded with reduced motion", async () => {
    matches = false;
    render(<AnimatedLine label="BTC" />);
    await flushMeasure();

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: no-preference)");
    expect(mockAnimate).not.toHaveBeenCalled();
    expect(mockScreenCTM).not.toHaveBeenCalled();
    expect(screen.getByTestId("line").style.strokeDasharray).toBe("");
    expect(screen.getByTestId("container").style.opacity).toBe("");
  });

  it("uses one linear 0.8s clock for both the draw and fade", async () => {
    render(<AnimatedLine label="BTC" />);
    await flushMeasure();

    expect(mockAnimate).toHaveBeenCalledWith(0, 1, expect.objectContaining({
      type: "tween", duration: 0.8, ease: "linear",
    }));
    expect(mockAnimate).toHaveBeenCalledTimes(1);
  });

  it("fades with the original quadratic in/out curve, finishing at 0.4s", async () => {
    render(<AnimatedLine label="BTC" />);
    await flushMeasure();
    const container = screen.getByTestId("container");
    const [{ options }] = animations();

    expect(container.style.opacity).toBe("0");
    for (const [progress, opacity] of [[0, 0], [0.125, 0.125], [0.25, 0.5], [0.375, 0.875], [0.5, 1], [1, 1]]) {
      options.onUpdate(progress);
      expect(Number(container.style.opacity)).toBe(opacity);
    }
  });

  it("draws the measured length with the original cubic-out curve over 0.8s", async () => {
    render(<AnimatedLine label="BTC" />);
    await flushMeasure();
    const line = screen.getByTestId("line");
    const [{ options }] = animations();

    expect(line.style.strokeDasharray).toBe("0px,120.1px");
    for (const [progress, ratio] of [[0, 0], [0.25, 0.578125], [0.5, 0.875], [0.75, 0.984375], [1, 1]]) {
      options.onUpdate(progress);
      expect(parseFloat(line.style.strokeDasharray)).toBeCloseTo(120 * ratio);
    }
    options.onComplete();
    expect(line.style.strokeDasharray).toBe("");
    expect(mockScreenCTM).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["stretched", { a: 120, b: 0, c: 0, d: 50 }, "0,0 1,1", 130],
    ["rotated", { a: 0, b: 120, c: -50, d: 0 }, "0,0 1,1", 130],
    ["multiple segments", { a: 120, b: 0, c: 0, d: 50 }, "0,0 1,0 1,1", 170],
    ["flat", { a: 120, b: 0, c: 0, d: 50 }, "0,0 0,0", 0],
  ])("measures a %s non-scaling polyline in screen units", async (_name, matrix, points, length) => {
    mockScreenCTM.mockReturnValue(matrix);
    render(<AnimatedLine label="BTC" points={points} />);
    await flushMeasure();
    const gap = parseFloat(screen.getByTestId("line").style.strokeDasharray.split(",")[1]);
    expect(gap - 0.1).toBeCloseTo(length);
  });

  it("measures all mounted lines before styling any of them", async () => {
    render(<><AnimatedLine label="BTC" /><AnimatedLine label="ETH" /></>);
    const lines = screen.getAllByTestId("line");
    const dashesAtMeasure: string[] = [];
    mockScreenCTM.mockImplementation(() => {
      dashesAtMeasure.push(...lines.map((line) => line.style.strokeDasharray));
      return { a: 120, b: 0, c: 0, d: 50 };
    });

    expect(mockScreenCTM).not.toHaveBeenCalled();
    await flushMeasure();
    expect(mockScreenCTM).toHaveBeenCalledTimes(2);
    expect(dashesAtMeasure.every((dash) => dash === "")).toBe(true);
    expect(mockAnimate).toHaveBeenCalledTimes(1);
  });

  it("keeps a sibling drawing when one participant unmounts", async () => {
    const { rerender, unmount } = render(<><AnimatedLine key="btc" label="BTC" /><AnimatedLine key="eth" label="ETH" /></>);
    await flushMeasure();
    const [animation] = animations();
    rerender(<><AnimatedLine key="eth" label="ETH" /></>);

    expect(animation.stop).not.toHaveBeenCalled();
    animation.options.onUpdate(0.5);
    expect(parseFloat(screen.getByTestId("line").style.strokeDasharray)).toBeCloseTo(105);
    unmount();
    expect(animation.stop).toHaveBeenCalledTimes(1);
  });

  it("cancels a draw when reduced motion changes before measurement", async () => {
    render(<AnimatedLine label="BTC" />);
    setMotionPreference(false);
    await flushMeasure();

    expect(mockScreenCTM).not.toHaveBeenCalled();
    expect(mockAnimate).not.toHaveBeenCalled();
    expect(screen.getByTestId("container").style.opacity).toBe("");
  });

  it("skips a line unmounted before measurement", async () => {
    const { unmount } = render(<AnimatedLine label="BTC" />);
    unmount();
    await flushMeasure();

    expect(mockScreenCTM).not.toHaveBeenCalled();
    expect(mockAnimate).not.toHaveBeenCalled();
    expect(mediaListeners.size).toBe(0);
  });

  it("stops on reduced motion, ignores stale callbacks, and replays when enabled", async () => {
    render(<AnimatedLine label="BTC" />);
    await flushMeasure();
    const [animation] = animations();
    setMotionPreference(false);

    expect(animation.stop).toHaveBeenCalledTimes(1);
    animation.options.onUpdate(0.25);
    animation.options.onComplete();
    expect(screen.getByTestId("line").style.strokeDasharray).toBe("");
    expect(screen.getByTestId("container").style.opacity).toBe("");

    setMotionPreference(true);
    await flushMeasure();
    expect(mockAnimate).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("line").style.strokeDasharray).toBe("0px,120.1px");
  });

  it("stops the animation and removes the media listener on unmount", async () => {
    const { unmount } = render(<AnimatedLine label="BTC" />);
    await flushMeasure();
    const line = screen.getByTestId("line");
    const container = screen.getByTestId("container");
    unmount();

    expect(animations()[0].stop).toHaveBeenCalledTimes(1);
    expect(line.style.strokeDasharray).toBe("");
    expect(container.style.opacity).toBe("");
    expect(mediaListeners.size).toBe(0);
  });

  it("only starts the active Strict Mode mount", async () => {
    render(<StrictMode><AnimatedLine label="BTC" /></StrictMode>);
    await flushMeasure();

    expect(mockAnimate).toHaveBeenCalledTimes(1);
    expect(mockScreenCTM).toHaveBeenCalledTimes(1);
    expect(mediaListeners.size).toBe(1);
  });
});
