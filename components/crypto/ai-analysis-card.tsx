"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import { BrainCircuit } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { Components } from "react-markdown";
import {
  AiAnalysisShimmer,
  AI_CARD_MIN_H,
} from "@/components/crypto/ai-analysis-shimmer";
import { cn } from "@/lib/utils/utils";
import Markdown from "react-markdown";
import { useCompletion } from "@ai-sdk/react";
import {
  AI_ANALYSIS_MODE_HEADER,
  AI_ANALYSIS_MODE_STORAGE_KEY,
  type AiAnalysisMode,
} from "@/lib/aiAnalysisMode";

interface AiAnalysisCardProps {
  name: string;
  symbol: string;
  /**
   * When true, render a per-browser mock/live toggle and send the
   * `x-ai-analysis-mode` header. Computed server-side from the deployment env;
   * the server remains authoritative over whether the request is honored.
   */
  aiOverrideAllowed?: boolean;
}

type Status = "idle" | "loading" | "streaming" | "complete" | "error";

function readStoredMode(): AiAnalysisMode | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(AI_ANALYSIS_MODE_STORAGE_KEY);
  return value === "live" || value === "mock" ? value : null;
}

// The per-browser mode preference is read through `useSyncExternalStore` so the
// value is SSR-safe (the server snapshot is null, avoiding a hydration mismatch)
// and updates reactively — both from this tab's writes and cross-tab `storage`
// events — without a setState-in-effect hydration hack.
const modeListeners = new Set<() => void>();

function subscribeStoredMode(callback: () => void) {
  modeListeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    modeListeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function getServerStoredMode(): AiAnalysisMode | null {
  return null;
}

function writeStoredMode(mode: AiAnalysisMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AI_ANALYSIS_MODE_STORAGE_KEY, mode);
  }
  // Notify same-tab subscribers — the `storage` event only fires cross-tab.
  modeListeners.forEach((listener) => listener());
}

/**
 * The route returns a JSON `{ error }` body on a pre-stream failure, which the
 * AI SDK's text stream protocol surfaces verbatim as `error.message`. Recover
 * the clean message where possible, falling back to the raw text.
 */
function normalizeError(error: Error | undefined): string | null {
  if (!error) return null;
  const raw = error.message?.trim();
  if (!raw) return "Something went wrong";
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error;
    }
  } catch {
    // Not JSON (e.g. a mid-stream failure) — fall through to the raw message.
  }
  return raw;
}

// Shared markdown renderer overrides — used by both the streaming and the
// final reveal states so partial and complete analysis render identically.
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-foreground mt-0 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-foreground mt-4 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-foreground mt-3 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-foreground/90 mb-3 leading-relaxed break-words">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-4 mb-3 space-y-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-foreground/90 leading-relaxed break-words">
      {children}
    </li>
  ),
  code: ({ children }) => (
    <code className="bg-muted/40 px-1.5 py-0.5 rounded text-xs font-mono text-foreground break-words">
      {children}
    </code>
  ),
};

function AnalysisMarkdown({ children }: { children: string }) {
  return (
    <div className="flex-1 prose prose-invert prose-sm max-w-none wrap-anywhere min-w-0">
      <Markdown components={markdownComponents}>{children}</Markdown>
    </div>
  );
}

/**
 * QA/demo-only mock vs. live inference toggle, persisted per browser. Rendered
 * only where the server permits the override (see `aiOverrideAllowed`).
 */
function ModeToggle({
  value,
  onChange,
}: {
  value: AiAnalysisMode | null;
  onChange: (mode: AiAnalysisMode) => void;
}) {
  const modes: AiAnalysisMode[] = ["live", "mock"];
  return (
    <div
      role="group"
      aria-label="AI inference mode"
      className="inline-flex items-center gap-1 rounded-full bg-muted/40 p-0.5 text-xs"
    >
      <span className="px-1.5 text-muted-foreground">Inference</span>
      {modes.map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(mode)}
            className={
              "rounded-full px-2.5 py-0.5 capitalize transition-colors " +
              (active
                ? "bg-stone-700/70 text-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}

export function AiAnalysisCard({
  name,
  symbol,
  aiOverrideAllowed = false,
}: AiAnalysisCardProps) {
  const requestedMode = useSyncExternalStore(
    subscribeStoredMode,
    readStoredMode,
    getServerStoredMode,
  );
  // Whether a generation has finished successfully at least once. Distinguishes
  // the pristine "idle" state from a finished run that happened to stream no
  // text, so an empty-but-successful response still reveals the completed card
  // (matching the pre-migration behavior) instead of silently reverting to idle.
  const [hasCompleted, setHasCompleted] = useState(false);
  // Tracks whether the Regenerate button's reveal (height grow) has finished, so
  // the wrapper can clip during the grow but switch to `overflow: visible` after
  // — otherwise the persistent clip cuts the button's hover translate / shadow.
  const [regenRevealed, setRegenRevealed] = useState(false);
  const reduce = useReducedMotion();
  const titleId = useId();

  // The AI SDK hook owns the streaming lifecycle: `completion` accumulates the
  // streamed text, `isLoading` covers the request window, `error` captures
  // failures, and `stop` aborts the in-flight request. Render state is derived
  // from these rather than tracked with ad-hoc flags. The route streams plain
  // token chunks, so the `text` stream protocol consumes it directly.
  const { completion, complete, error, isLoading, stop } = useCompletion({
    api: `/api/ai-analysis/${symbol}`,
    streamProtocol: "text",
    onFinish: () => setHasCompleted(true),
  });

  // Abort any in-flight stream when the component unmounts (e.g. the user
  // navigates away mid-stream) so the server stops generating. `stop` can change
  // identity between renders, so call the latest via a ref to keep the cleanup
  // strictly unmount-only.
  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  });
  useEffect(() => () => stopRef.current(), []);

  const handleGenerate = () => {
    // Send the per-browser override as a request header where permitted. Passing
    // it per-call (rather than at hook init) ensures the latest selection is used
    // and avoids a stale value after toggling. The hook clears the previous
    // completion and aborts any prior request, so this also covers regenerate.
    const options =
      aiOverrideAllowed && requestedMode
        ? { headers: { [AI_ANALYSIS_MODE_HEADER]: requestedMode } }
        : undefined;
    setHasCompleted(false);
    // Re-arm the reveal clip so the next streaming → complete grows in cleanly.
    setRegenRevealed(false);
    void complete("", options);
  };

  const errorMessage = normalizeError(error);

  const status: Status = errorMessage
    ? "error"
    : isLoading && completion.length === 0
      ? "loading"
      : isLoading
        ? "streaming"
        : completion.length > 0 || hasCompleted
          ? "complete"
          : "idle";

  if (status === "loading") {
    return <AiAnalysisShimmer footer="generating" />;
  }

  if (status === "streaming" || status === "complete") {
    const isStreaming = status === "streaming";
    return (
      <Card
        className={cn("glassmorphic min-w-[220px]", AI_CARD_MIN_H)}
        role="region"
        aria-labelledby={titleId}
        aria-busy={isStreaming}
      >
        {/* Polite live region announces completion. It stays silent while
            streaming because the loading state already announced "Generating
            analysis…" — re-announcing on the loading → streaming transition
            would double-speak — and reading every streamed token would be noise. */}
        <span className="sr-only" role="status" aria-live="polite">
          {isStreaming ? "" : "Analysis ready."}
        </span>
        <CardHeader>
          <CardTitle id={titleId}>AI Analysis</CardTitle>
          <CardDescription>
            AI-powered insights for {name}
          </CardDescription>
          <CardAction>
            <span className="inline-flex items-center justify-center rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Beta
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col px-4 sm:px-6">
          {/* Content row grows to fill the reserved height so the footer below
              stays pinned to the bottom — the "Generating analysis…" indicator
              holds the same position from the loading skeleton through streaming
              instead of jumping up to sit under the first token. */}
          <div className="flex flex-1 items-start gap-4 sm:gap-6 mb-6">
            {/* Icon Container */}
            <div className="hidden sm:block flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800/40 backdrop-blur-sm ring-1 ring-stone-700/30">
                <BrainCircuit
                  aria-hidden="true"
                  className="h-6 w-6 text-stone-300"
                />
              </div>
            </div>

            {/* Analysis Content */}
            <AnalysisMarkdown>{completion}</AnalysisMarkdown>
          </div>

          {/* Footer swaps the streaming indicator for the Regenerate button.
              Both states share one CSS grid cell (`col/row-start-1`), so the
              footer height always tracks the taller child: on streaming →
              complete the indicator cross-fades out while the button row grows
              in (height 0 → auto), easing the card taller monotonically — no
              overshoot, no dip. Collapses to an instant swap under reduced
              motion. */}
          <div className="grid">
            <AnimatePresence initial={false}>
              {isStreaming ? (
                <motion.div
                  key="generating"
                  className="col-start-1 row-start-1 flex items-center justify-end gap-2 text-sm text-muted-foreground"
                  aria-hidden="true"
                  exit={{ opacity: 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <BrainCircuit className="size-4 animate-pulse" />
                  <span className="animate-pulse">Generating analysis…</span>
                </motion.div>
              ) : (
                <motion.div
                  key="regenerate"
                  className="col-start-1 row-start-1"
                  // Clip only while the row grows in; once revealed, switch to
                  // visible so the button's hover translate and shadow aren't cut.
                  style={{
                    overflow: regenRevealed || reduce ? undefined : "hidden",
                  }}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  onAnimationComplete={() => setRegenRevealed(true)}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <div className="flex justify-end">
                    <ActionButton onClick={handleGenerate}>
                      Regenerate Analysis
                      <BrainCircuit
                        aria-hidden="true"
                        className="size-5 group-hover:translate-x-1 rotate-180 group-hover:rotate-0 transition duration-300 ease-out group-active:translate-x-2"
                      />
                    </ActionButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="glassmorphic min-w-[220px]"
      role="region"
      aria-labelledby={titleId}
    >
      {/* Header Zone */}
      <CardHeader>
        <CardTitle id={titleId}>AI Analysis</CardTitle>
        <CardDescription>
          Get AI-powered insights and analysis for {name}
        </CardDescription>
        <CardAction>
          <span className="inline-flex items-center justify-center rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Beta
          </span>
        </CardAction>
      </CardHeader>

      {/* Empty-State Content Zone */}
      <CardContent className="px-4 sm:px-6">
        <div className="flex items-start gap-4 sm:gap-6 mb-8">
          {/* Icon Container */}
          <div className="hidden sm:block flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800/40 backdrop-blur-sm ring-1 ring-stone-700/30">
              <BrainCircuit
                aria-hidden="true"
                className="h-6 w-6 text-stone-300"
              />
            </div>
          </div>

          {/* Text Block */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No analysis generated yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate AI-powered market analysis using real-time price data, VWAP metrics, and recent news sentiment for {name}.
              </p>
            </div>

            {/* Bulleted List */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-stone-500 mt-0.5">•</span>
                <span>
                  <strong className="font-medium text-foreground">
                    Market Bias
                  </strong>{" "}
                  — Current short-term direction (bullish / bearish / sideways)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-500 mt-0.5">•</span>
                <span>
                  <strong className="font-medium text-foreground">
                    Price Analysis
                  </strong>{" "}
                  — Key levels, VWAP context, and support/resistance zones
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-500 mt-0.5">•</span>
                <span>
                  <strong className="font-medium text-foreground">
                    News Sentiment
                  </strong>{" "}
                  — Impact of recent developments and market narratives
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-500 mt-0.5">•</span>
                <span>
                  <strong className="font-medium text-foreground">
                    Key Takeaway
                  </strong>{" "}
                  — Actionable insight based on data-driven observations
                </span>
              </li>
            </ul>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground/80 pt-1">
              Analysis uses 14-day price history, volume-weighted metrics, and real-time news. Takes 5-10 seconds. Not financial advice.
            </p>
          </div>
        </div>

        {/* Button Row */}
        <div className="flex items-center justify-between gap-3">
          {aiOverrideAllowed ? (
            <ModeToggle value={requestedMode} onChange={writeStoredMode} />
          ) : (
            <span />
          )}
          <ActionButton onClick={handleGenerate}>
            {status === "error" ? "Try Again" : "Generate AI Analysis"}
            <BrainCircuit
              aria-hidden="true"
              className={
                "size-5 group-hover:translate-x-1 rotate-180 " +
                "group-hover:rotate-0 transition duration-300 ease-out " +
                "group-active:translate-x-2"
              }
            />
          </ActionButton>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
