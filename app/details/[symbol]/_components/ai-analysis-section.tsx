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
import { useEffect, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ShimmerCard from "@/components/ui/shimmer-card";
import Markdown from "react-markdown";

interface AiAnalysisSectionProps {
  name: string;
  symbol: string;
}

type Status = "idle" | "loading" | "streaming" | "complete" | "error";

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

export function AiAnalysisSection({
  name,
  symbol,
}: AiAnalysisSectionProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream when the component unmounts (e.g. the user
  // navigates away mid-stream) so the server stops generating.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleGenerate = async () => {
    // Cancel a previous in-flight request (e.g. a rapid regenerate).
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setText("");
    setError(null);

    try {
      const response = await fetch(`/api/ai-analysis/${symbol}`, {
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to generate analysis");
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let started = false;

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        accumulated += chunk;
        if (!started) {
          started = true;
          setStatus("streaming");
        }
        setText(accumulated);
      }

      // Flush any buffered multi-byte character left in the decoder.
      const tail = decoder.decode();
      if (tail) {
        accumulated += tail;
        setText(accumulated);
      }

      setStatus("complete");
    } catch (err) {
      // A deliberate abort (unmount / regenerate) is not an error to surface.
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return <ShimmerCard className="min-w-[220px]" />;
  }

  if (status === "streaming" || status === "complete") {
    const isStreaming = status === "streaming";
    return (
      <Card className="glassmorphic min-w-[220px]">
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>
            AI-powered insights for {name}
          </CardDescription>
          <CardAction>
            <span className="inline-flex items-center justify-center rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Beta
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-start gap-4 sm:gap-6 mb-6">
            {/* Icon Container */}
            <div className="hidden sm:block flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800/40 backdrop-blur-sm ring-1 ring-stone-700/30">
                <BrainCircuit className="h-6 w-6 text-stone-300" />
              </div>
            </div>

            {/* Analysis Content */}
            <AnalysisMarkdown>{text}</AnalysisMarkdown>
          </div>

          {isStreaming ? (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <BrainCircuit className="size-4 animate-pulse" />
              <span className="animate-pulse">Generating analysis…</span>
            </div>
          ) : (
            <div className="flex justify-end">
              <ActionButton onClick={handleGenerate}>
                Regenerate Analysis
                <BrainCircuit className="size-5 group-hover:translate-x-1 rotate-180 group-hover:rotate-0 transition duration-300 ease-out group-active:translate-x-2" />
              </ActionButton>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphic min-w-[220px]">
      {/* Header Zone */}
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
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
              <BrainCircuit className="h-6 w-6 text-stone-300" />
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
        <div className="flex justify-end">
          <ActionButton onClick={handleGenerate}>
            {status === "error" ? "Try Again" : "Generate AI Analysis"}
            <BrainCircuit
              className={
                "size-5 group-hover:translate-x-1 rotate-180 " +
                "group-hover:rotate-0 transition duration-300 ease-out " +
                "group-active:translate-x-2"
              }
            />
          </ActionButton>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
