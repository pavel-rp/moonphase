import React, { StrictMode } from "react";
import { act, render, screen } from "@testing-library/react";
import { LayoutTransition } from "../layout-transition.client";

let mockPathname = "/";
let mockSegment: string | null = null;

// The page wrapper renders as a plain div. Its `key` (the segment) still
// remounts the page on a route change, as AnimatePresence does after the exit.
jest.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="page">{children}</div>
    ),
  },
}));

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSelectedLayoutSegment: () => mockSegment,
}));

function App() {
  return (
    <LayoutTransition>
      <p>Page at {mockPathname}</p>
    </LayoutTransition>
  );
}

type Rerender = (ui: React.ReactElement) => void;

// Moves to `path` the way the router does: the URL changes (with a popstate
// for Back/Forward), then the tree re-renders with the new route.
function navigate(rerender: Rerender, path: string, { pop = false } = {}) {
  act(() => {
    window.history.pushState({}, "", path);
    if (pop) {
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  });
  mockPathname = path;
  mockSegment = path === "/" ? null : path.split("/")[1];
  rerender(<App />);
}

function setPageHeight(height: number) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: height,
    configurable: true,
  });
}

describe("LayoutTransition", () => {
  let scrollTo: jest.SpyInstance;

  beforeEach(() => {
    window.history.pushState({}, "", "/");
    window.history.scrollRestoration = "auto";
    mockPathname = "/";
    mockSegment = null;
    setPageHeight(10000);
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    scrollTo = jest
      .spyOn(window, "scrollTo")
      .mockImplementation(((options: ScrollToOptions) => {
        window.scrollY = options.top ?? 0;
      }) as typeof window.scrollTo);
  });

  afterEach(() => {
    scrollTo.mockRestore();
    jest.useRealTimers();
  });

  it("renders the current page", () => {
    render(<App />);

    expect(screen.getByText("Page at /")).toBeInTheDocument();
  });

  it("leaves the first page where the browser put it", () => {
    render(<App />);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("leaves the first page alone under Strict Mode's double effects", () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("starts a page reached by a link at the top", () => {
    const { rerender } = render(<App />);
    window.scrollY = 3000;

    navigate(rerender, "/details/btc");

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  });

  it("restores where each page was left on Back and Forward", () => {
    const { rerender } = render(<App />);
    window.scrollY = 3000;
    navigate(rerender, "/details/btc");
    window.scrollY = 400;

    navigate(rerender, "/", { pop: true });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 3000, behavior: "instant" });

    navigate(rerender, "/details/btc", { pop: true });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 400, behavior: "instant" });
  });

  it("doesn't let a Back that stayed on the same segment turn a later link into a restore", () => {
    const { rerender } = render(<App />);
    window.scrollY = 3000;
    navigate(rerender, "/details/btc");

    // Same "details" segment, so no page mounts to consume the pop.
    navigate(rerender, "/details/eth", { pop: true });
    navigate(rerender, "/");

    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
  });

  it("keeps retrying a restore until the page is tall enough", () => {
    jest.useFakeTimers();
    const { rerender } = render(<App />);
    window.scrollY = 3000;
    navigate(rerender, "/details/btc");

    // The page coming back is still short (its content is streaming in).
    setPageHeight(1000);
    navigate(rerender, "/", { pop: true });
    const callsWhileShort = scrollTo.mock.calls.length;

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(scrollTo.mock.calls.length).toBeGreaterThan(callsWhileShort);

    setPageHeight(10000);
    act(() => {
      jest.advanceTimersByTime(50);
    });
    const callsOnceTall = scrollTo.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(scrollTo.mock.calls.length).toBe(callsOnceTall);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 3000, behavior: "instant" });
  });

  it.each([
    ["the user scrolls", () => window.dispatchEvent(new Event("wheel"))],
    ["two seconds pass", () => jest.advanceTimersByTime(2100)],
  ])("stops retrying a restore when %s", (_name, interrupt) => {
    jest.useFakeTimers();
    const { rerender } = render(<App />);
    window.scrollY = 3000;
    navigate(rerender, "/details/btc");
    setPageHeight(1000);
    navigate(rerender, "/", { pop: true });

    act(() => {
      interrupt();
    });
    const callsAfterStop = scrollTo.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(scrollTo.mock.calls.length).toBe(callsAfterStop);
  });

  it("cancels a restore that is still retrying when the user navigates again", () => {
    jest.useFakeTimers();
    const { rerender } = render(<App />);
    window.scrollY = 3000;
    navigate(rerender, "/details/btc");
    setPageHeight(1000);
    navigate(rerender, "/", { pop: true });

    // A card click while home is still short.
    navigate(rerender, "/details/eth");
    scrollTo.mockClear();
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(scrollTo).not.toHaveBeenCalled();
    expect(window.scrollY).toBe(0);
  });

  it("finishes a restore to the top at once on a page shorter than the viewport", () => {
    jest.useFakeTimers();
    const { rerender } = render(<App />);
    navigate(rerender, "/details/btc");
    setPageHeight(300);

    navigate(rerender, "/", { pop: true });
    const calls = scrollTo.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(scrollTo.mock.calls.length).toBe(calls);
  });

  it("takes over scroll restoration and hands it back when the page is left", () => {
    render(<App />);
    expect(window.history.scrollRestoration).toBe("manual");

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(window.history.scrollRestoration).toBe("auto");

    act(() => {
      window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    });
    expect(window.history.scrollRestoration).toBe("manual");
  });

  it("waits for load before taking over, so a reload's native restore can finish", () => {
    const readyState = jest.spyOn(document, "readyState", "get").mockReturnValue("loading");
    render(<App />);
    expect(window.history.scrollRestoration).toBe("auto");

    act(() => {
      window.dispatchEvent(new Event("load"));
    });
    expect(window.history.scrollRestoration).toBe("manual");
    readyState.mockRestore();
  });
});
