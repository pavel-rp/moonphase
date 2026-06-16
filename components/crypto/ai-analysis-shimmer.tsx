import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { cn } from "@/lib/utils/utils";

interface AiAnalysisShimmerProps {
  /**
   * Footer affordance:
   * - `"generating"` — the pulsing "Generating analysis…" indicator plus an
   *   `sr-only` polite live-region announcement. Used by the in-component
   *   loading state, where a request is genuinely in flight before the first
   *   streamed token.
   * - `"neutral"` (default) — a neutral shimmer bar with no announcement. Used
   *   by the Suspense fallback, which resolves into the card's idle/empty state;
   *   announcing "Generating…" there would be a false claim.
   */
  footer?: "generating" | "neutral";
  className?: string;
}

// Shared minimum footprint so the AI card only ever GROWS across
// idle → loading → streaming, never shrinks (NEU-23 feedback). The idle/empty
// state is the tallest of the lightweight states, and it grows taller as the
// viewport narrows (more text wrapping), so the floor is sized per breakpoint to
// the measured idle height: ~670px @320 · ~554px @360 · ~502px @640 · ~398px
// @≥1024. Applied to the states that FOLLOW idle — the "generating" skeleton and
// the streaming/complete card — but not to idle itself or the neutral Suspense
// fallback (which precede idle and should grow into it). If the idle copy in
// `ai-analysis-card.tsx` changes materially, re-measure and update these.
export const AI_CARD_MIN_H = "min-h-[680px] sm:min-h-[510px] lg:min-h-[400px]";

// The generating skeleton uses a FIXED height (not just a floor) — same
// per-breakpoint values as AI_CARD_MIN_H — so the line-fill grid below has a
// definite height to lay out whole rows against (CSS `auto-fill` can't resolve
// against an indefinite `min-height`). It is still ≥ the idle height, so the
// skeleton only ever grows from idle. Keep these values in sync with
// AI_CARD_MIN_H.
const AI_SHIMMER_H = "h-[680px] sm:h-[510px] lg:h-[400px]";

// A body that fills its height with WHOLE text-line bars (no clipped half-line)
// so the generating skeleton is as large as the idle text it stands in for. CSS
// grid `auto-fill` lays out as many 1rem (16px) line rows as fully fit, with a
// 12px gap; any leftover (< one line) stays empty at the bottom. Extra bars
// beyond what fits collapse to `grid-auto-rows: 0`, so a partial line can never
// render regardless of the card's height. `aria-hidden` — purely decorative.
const SHIMMER_LINE_COUNT = 28; // enough to fill the tallest (narrow-mobile) card

// Reuse the ShimmerCard idiom — `bg-gray-400 rounded opacity-30` bars — so the
// AI skeleton reads as the same visual family. The pulse lives on the Card
// wrapper (as in ShimmerCard) and is suppressed under `prefers-reduced-motion`.
function Bar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded bg-gray-400 opacity-30", className)}
    />
  );
}

/**
 * Loading skeleton for the AI analysis card. Its silhouette mirrors the
 * streaming/complete branch of `AiAnalysisCard` (glassmorphic card → header with
 * title/subtitle/Beta placeholders → an avatar bubble beside a multi-line text
 * body) so the skeleton → content handoff produces no structural jump. Unlike
 * the generic `ShimmerCard`, it carries no price sparkline.
 */
export function AiAnalysisShimmer({
  footer = "neutral",
  className,
}: AiAnalysisShimmerProps) {
  const isGenerating = footer === "generating";

  return (
    <div aria-busy="true" data-testid="ai-analysis-shimmer">
      {isGenerating && (
        <span className="sr-only" role="status" aria-live="polite">
          Generating analysis…
        </span>
      )}
      <Card
        className={cn(
          "glassmorphic min-w-[220px] animate-pulse motion-reduce:animate-none",
          // Only the generating skeleton follows the idle state, so only it
          // carries the no-shrink height; the neutral Suspense fallback stays
          // compact and grows into idle.
          isGenerating && AI_SHIMMER_H,
          className,
        )}
      >
        {/* Header — title / subtitle / Beta pill placeholders. Mirrors the real
            header's grid (CardAction switches it to a two-column layout). */}
        <CardHeader>
          <div className="flex flex-col gap-1.5">
            <Bar className="h-5 w-28" />
            <Bar className="h-4 w-44" />
          </div>
          {/* Real CardAction so CardHeader's `has-data-[slot=card-action]`
              two-column grid resolves identically to the streaming card. */}
          <CardAction>
            <Bar className="h-5 w-10 rounded-full" />
          </CardAction>
        </CardHeader>

        {/* `min-h-0` + `overflow-hidden` so the fill grid shrinks to the card's
            fixed height and clips inside it — without `min-h-0` the flex chain
            keeps its content's natural height and overflows past the card. */}
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 sm:px-6">
          {/* Content row — 12×12 avatar bubble + text-line body, using the
              streaming card's exact spacing so there is no layout shift. The row
              grows to fill the reserved height. */}
          <div className="flex min-h-0 flex-1 items-start gap-4 sm:gap-6 mb-6">
            <div className="hidden sm:block flex-shrink-0">
              <Bar className="h-12 w-12 rounded-full" />
            </div>
            {isGenerating ? (
              // Fill the reserved height with WHOLE line bars (auto-fill rows +
              // collapsed overflow) so the skeleton is as large as the idle text
              // with no void and no clipped half-line.
              <div
                aria-hidden="true"
                className="grid min-h-0 flex-1 content-start gap-3 self-stretch overflow-hidden [grid-auto-rows:0] [grid-template-rows:repeat(auto-fill,1rem)]"
              >
                {Array.from({ length: SHIMMER_LINE_COUNT }).map((_, i) => (
                  <div key={i} className="rounded bg-gray-400 opacity-30" />
                ))}
              </div>
            ) : (
              // Compact body — the neutral fallback stays small and grows into
              // the idle state it resolves to.
              <div className="flex-1 space-y-3">
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-11/12" />
                <Bar className="h-4 w-4/5" />
                <Bar className="h-4 w-2/3" />
              </div>
            )}
          </div>

          {/* Footer — pulsing "Generating analysis…" indicator (mirrors the
              streaming footer) or a neutral button-shaped shimmer bar. */}
          {isGenerating ? (
            // Same muted, animated CTA as the streaming card so the
            // "Generating analysis…" affordance is identical through
            // loading → streaming → (active) Regenerate.
            <div className="flex justify-end" aria-hidden="true">
              <ActionButton loading>
                Generating analysis…
                <span className="inline-flex animate-icon-thinking motion-reduce:animate-none">
                  <BrainCircuit className="size-5" />
                </span>
              </ActionButton>
            </div>
          ) : (
            <div className="flex justify-end">
              <Bar className="h-9 w-40" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AiAnalysisShimmer;
