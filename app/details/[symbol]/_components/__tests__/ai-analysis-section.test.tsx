import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// react-markdown ships as ESM and is not transformed by Jest; mock it with a
// passthrough that renders the raw markdown text so we can assert on content.
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <>{children}</>,
}));

import { AiAnalysisSection } from "../ai-analysis-section";
import {
  AI_ANALYSIS_MODE_HEADER,
  AI_ANALYSIS_MODE_STORAGE_KEY,
} from "@/lib/aiAnalysisMode";

/** Build a fetch Response-like object whose body streams the given chunks. */
function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  return {
    ok: true,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
  } as unknown as Response;
}

/** A streaming Response that emits one chunk then errors the stream. */
function midStreamErrorResponse(first: string): Response {
  const encoder = new TextEncoder();
  return {
    ok: true,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(first));
        controller.error(new Error("stream blew up"));
      },
    }),
  } as unknown as Response;
}

describe("AiAnalysisSection", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("renders the empty state with a Generate button", () => {
    render(<AiAnalysisSection name="Bitcoin" symbol="BTC" />);

    expect(screen.getByText("AI Analysis")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    ).toBeInTheDocument();
  });

  it("streams the analysis and then reveals it with a Regenerate button", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        // Leading empty chunk exercises the "skip empty chunk" path.
        streamResponse(["", "## Market Bias\n", "Bullish ", "momentum building."]),
      );

    render(<AiAnalysisSection name="Bitcoin" symbol="BTC" />);
    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );

    // Progressive content is rendered from the stream.
    expect(await screen.findByText(/Bullish momentum building\./i)).toBeInTheDocument();
    // On completion the Regenerate CTA appears.
    expect(
      await screen.findByRole("button", { name: /regenerate analysis/i }),
    ).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/ai-analysis/BTC",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("does not render the inference toggle or send a mode header by default", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(streamResponse(["Bullish."]));
    global.fetch = fetchMock;

    render(<AiAnalysisSection name="Bitcoin" symbol="BTC" />);
    expect(
      screen.queryByRole("group", { name: /inference mode/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );
    await screen.findByText(/Bullish\./i);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).toEqual({});
  });

  it("renders the toggle and sends the stored mode header when override is allowed", async () => {
    window.localStorage.setItem(AI_ANALYSIS_MODE_STORAGE_KEY, "mock");
    const fetchMock = jest
      .fn()
      .mockResolvedValue(streamResponse(["## Market Bias\n", "Bullish."]));
    global.fetch = fetchMock;

    render(<AiAnalysisSection name="Bitcoin" symbol="BTC" aiOverrideAllowed />);

    expect(
      screen.getByRole("group", { name: /inference mode/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );
    await screen.findByText(/Bullish\./i);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai-analysis/BTC",
      expect.objectContaining({
        method: "POST",
        headers: { [AI_ANALYSIS_MODE_HEADER]: "mock" },
      }),
    );
  });

  it("persists the selected mode and sends it after toggling", async () => {
    const fetchMock = jest.fn().mockResolvedValue(streamResponse(["Bullish."]));
    global.fetch = fetchMock;

    render(<AiAnalysisSection name="Bitcoin" symbol="BTC" aiOverrideAllowed />);

    const mockButton = screen.getByRole("button", { name: /^mock$/i });
    fireEvent.click(mockButton);
    expect(mockButton).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem(AI_ANALYSIS_MODE_STORAGE_KEY)).toBe("mock");

    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );
    await screen.findByText(/Bullish\./i);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai-analysis/BTC",
      expect.objectContaining({ headers: { [AI_ANALYSIS_MODE_HEADER]: "mock" } }),
    );
  });

  it("shows the error state when the response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Too many requests" }),
    } as unknown as Response);

    render(<AiAnalysisSection name="Bitcoin" symbol="BTC" />);
    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );

    expect(await screen.findByText("Too many requests")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("shows the error state when the stream fails mid-way", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(midStreamErrorResponse("Partial analysis "));

    render(<AiAnalysisSection name="Bitcoin" symbol="BTC" />);
    fireEvent.click(
      screen.getByRole("button", { name: /generate ai analysis/i }),
    );

    expect(
      await screen.findByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });
});
