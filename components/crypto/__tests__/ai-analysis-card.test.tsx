import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// react-markdown ships as ESM and is not transformed the same way; mock it with
// a passthrough that renders the raw markdown text so we can assert on content.
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <>{children}</>,
}));

// Controllable mock of the AI SDK `useCompletion` hook. The component derives
// all of its render state from the hook return values, so the tests drive those
// values directly and assert on the resulting UI + the arguments the component
// passes back into `complete()`. jest only allows the factory to reference
// out-of-scope identifiers prefixed with `mock`.
type MockHookState = {
  completion: string;
  isLoading: boolean;
  error: Error | undefined;
};
const mockHookState: MockHookState = {
  completion: "",
  isLoading: false,
  error: undefined,
};
let mockComplete: jest.Mock;
let mockStop: jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockCapturedOptions: any;
let mockOnFinish: (() => void) | undefined;
let mockForce: (() => void) | undefined;

jest.mock("@ai-sdk/react", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useCompletion: (options: any) => {
      mockCapturedOptions = options;
      mockOnFinish = options?.onFinish;
      const [, force] = React.useReducer((c: number) => c + 1, 0);
      mockForce = force;
      return {
        completion: mockHookState.completion,
        isLoading: mockHookState.isLoading,
        error: mockHookState.error,
        complete: mockComplete,
        stop: mockStop,
        setCompletion: jest.fn(),
        input: "",
        setInput: jest.fn(),
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
      };
    },
  };
});

import { AiAnalysisCard } from "@/components/crypto/ai-analysis-card";
import {
  AI_ANALYSIS_MODE_HEADER,
  AI_ANALYSIS_MODE_STORAGE_KEY,
} from "@/lib/aiAnalysisMode";

/** Mutate the mocked hook state (and optionally fire onFinish), then re-render. */
function setHook(
  partial: Partial<MockHookState>,
  opts: { finish?: boolean } = {},
) {
  act(() => {
    Object.assign(mockHookState, partial);
    if (opts.finish) mockOnFinish?.();
    mockForce?.();
  });
}

describe("AiAnalysisCard", () => {
  beforeEach(() => {
    mockHookState.completion = "";
    mockHookState.isLoading = false;
    mockHookState.error = undefined;
    mockComplete = jest.fn();
    mockStop = jest.fn();
    mockCapturedOptions = undefined;
    mockOnFinish = undefined;
    mockForce = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("points the hook at the per-symbol route using the text stream protocol", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    expect(mockCapturedOptions.api).toBe("/api/ai-analysis/BTC");
    expect(mockCapturedOptions.streamProtocol).toBe("text");
  });

  it("renders the idle empty state with a Generate button", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);

    expect(
      screen.getByRole("region", { name: /ai analysis/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no analysis generated yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    ).toBeInTheDocument();
  });

  it("triggers a generation with an empty prompt and no mode header by default", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);

    expect(
      screen.queryByRole("group", { name: /inference mode/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );

    expect(mockComplete).toHaveBeenCalledWith("", undefined);
  });

  it("shows the AI-shaped shimmer loading state with a polite status while awaiting the first token", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    setHook({ isLoading: true, completion: "" });

    // The dedicated AI skeleton renders — not the generic crypto ShimmerCard.
    expect(screen.getByTestId("ai-analysis-shimmer")).toBeInTheDocument();

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/generating analysis/i);
    // The empty/idle CTA is gone while loading.
    expect(
      screen.queryByRole("button", { name: /generate ai analysis/i }),
    ).not.toBeInTheDocument();
  });

  it("renders streaming markdown progressively inside a labelled region", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    setHook({ isLoading: true, completion: "## Market Bias\nBullish momentum" });

    expect(
      screen.getByRole("region", { name: /ai analysis/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Bullish momentum/)).toBeInTheDocument();
    // A live status region exists during streaming.
    expect(screen.getByRole("status")).toBeInTheDocument();
    // No Regenerate button yet — still streaming.
    expect(
      screen.queryByRole("button", { name: /regenerate analysis/i }),
    ).not.toBeInTheDocument();
  });

  it("reveals the complete analysis with a Regenerate button and an announcement", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    setHook({ isLoading: true, completion: "Bullish momentum building." });
    setHook(
      { isLoading: false, completion: "Bullish momentum building." },
      { finish: true },
    );

    expect(screen.getByText("Bullish momentum building.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /regenerate analysis/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/analysis ready/i);
  });

  it("regenerates: clicking Regenerate triggers another generation", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    setHook({ isLoading: false, completion: "Some analysis." }, { finish: true });

    fireEvent.click(
      screen.getByRole("button", { name: /regenerate analysis/i }),
    );

    expect(mockComplete).toHaveBeenCalledWith("", undefined);
  });

  it("treats a finished-but-empty stream as complete, not idle", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    // A successful stream that emitted no text still resolves to the complete
    // card (Regenerate available) rather than silently reverting to idle.
    setHook({ isLoading: true, completion: "" });
    setHook({ isLoading: false, completion: "" }, { finish: true });

    expect(
      screen.getByRole("button", { name: /regenerate analysis/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /generate ai analysis/i }),
    ).not.toBeInTheDocument();
  });

  it("normalizes a JSON error body and surfaces it as an alert with Try Again", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    // The AI SDK text protocol surfaces the route's JSON `{ error }` body
    // verbatim in `error.message`; the component recovers the message.
    setHook({
      isLoading: false,
      error: new Error(JSON.stringify({ error: "Too many requests" })),
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Too many requests");
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("falls back to the raw message for a non-JSON (mid-stream) error", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    setHook({
      isLoading: false,
      completion: "Partial analysis ",
      error: new Error("stream blew up"),
    });

    expect(screen.getByRole("alert")).toHaveTextContent("stream blew up");
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("shows a generic message for an error with no message text", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    setHook({ isLoading: false, error: new Error("") });

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("falls back to the raw text for a JSON error body without an error field", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
    setHook({
      isLoading: false,
      error: new Error(JSON.stringify({ message: "nope" })),
    });

    expect(screen.getByRole("alert")).toHaveTextContent('{"message":"nope"}');
  });

  it("renders the toggle and sends the stored mode header when override is allowed", () => {
    window.localStorage.setItem(AI_ANALYSIS_MODE_STORAGE_KEY, "mock");
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" aiOverrideAllowed />);

    expect(
      screen.getByRole("group", { name: /inference mode/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );

    expect(mockComplete).toHaveBeenCalledWith("", {
      headers: { [AI_ANALYSIS_MODE_HEADER]: "mock" },
    });
  });

  it("persists the selected mode and sends it after toggling", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" aiOverrideAllowed />);

    const mockButton = screen.getByRole("button", { name: /^mock$/i });
    fireEvent.click(mockButton);
    expect(mockButton).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem(AI_ANALYSIS_MODE_STORAGE_KEY)).toBe(
      "mock",
    );

    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );

    expect(mockComplete).toHaveBeenCalledWith("", {
      headers: { [AI_ANALYSIS_MODE_HEADER]: "mock" },
    });
  });

  it("aborts the in-flight stream on unmount", () => {
    const { unmount } = render(
      <AiAnalysisCard name="Bitcoin" symbol="BTC" />,
    );
    setHook({ isLoading: true, completion: "partial" });

    unmount();

    expect(mockStop).toHaveBeenCalled();
  });

  describe("copy-to-clipboard", () => {
    /** Install a controllable `navigator.clipboard.writeText` mock. */
    function mockClipboard(impl: () => Promise<void>) {
      const writeText = jest.fn(impl);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });
      return writeText;
    }

    it("copies the raw markdown analysis and shows a confirmation", async () => {
      const writeText = mockClipboard(() => Promise.resolve());
      render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
      setHook(
        { isLoading: false, completion: "## Bias\nBullish momentum." },
        { finish: true },
      );

      fireEvent.click(
        screen.getByRole("button", { name: /copy analysis to clipboard/i }),
      );

      expect(writeText).toHaveBeenCalledWith("## Bias\nBullish momentum.");
      // The confirmation appears once the async write resolves.
      expect(await screen.findByText("Copied")).toBeInTheDocument();
      expect(
        screen.getByText("Analysis copied to clipboard."),
      ).toBeInTheDocument();
    });

    it("reverts the confirmation after the timeout", async () => {
      jest.useFakeTimers();
      try {
        mockClipboard(() => Promise.resolve());
        render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
        setHook({ isLoading: false, completion: "Done." }, { finish: true });

        fireEvent.click(
          screen.getByRole("button", { name: /copy analysis to clipboard/i }),
        );
        // Flush the writeText microtask so `copied` flips to true.
        await act(async () => {
          await Promise.resolve();
        });
        expect(screen.getByText("Copied")).toBeInTheDocument();

        act(() => {
          jest.advanceTimersByTime(2000);
        });
        expect(screen.getByText("Copy")).toBeInTheDocument();
      } finally {
        jest.useRealTimers();
      }
    });

    it("does not confirm when the clipboard write is rejected", async () => {
      mockClipboard(() => Promise.reject(new Error("denied")));
      render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
      setHook({ isLoading: false, completion: "Done." }, { finish: true });

      fireEvent.click(
        screen.getByRole("button", { name: /copy analysis to clipboard/i }),
      );
      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    });

    it("is a no-op when the clipboard API is unavailable", () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });
      render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);
      setHook({ isLoading: false, completion: "Done." }, { finish: true });

      const button = screen.getByRole("button", {
        name: /copy analysis to clipboard/i,
      });
      expect(() => fireEvent.click(button)).not.toThrow();
      expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    });

    it("omits the copy button while streaming and for an empty completed stream", () => {
      render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);

      setHook({ isLoading: true, completion: "Streaming…" });
      expect(
        screen.queryByRole("button", { name: /copy analysis to clipboard/i }),
      ).not.toBeInTheDocument();

      setHook({ isLoading: false, completion: "" }, { finish: true });
      expect(
        screen.queryByRole("button", { name: /copy analysis to clipboard/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("renders a completion timestamp on complete but not while streaming", () => {
    render(<AiAnalysisCard name="Bitcoin" symbol="BTC" />);

    setHook({ isLoading: true, completion: "Partial analysis" });
    expect(screen.queryByText(/generated at/i)).not.toBeInTheDocument();

    setHook(
      { isLoading: false, completion: "Partial analysis done." },
      { finish: true },
    );
    expect(screen.getByText(/generated at/i)).toBeInTheDocument();
  });
});
