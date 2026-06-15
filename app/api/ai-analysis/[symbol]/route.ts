import { NextResponse } from 'next/server';
import { analyzeAssetStream } from '@/lib/data/aiAnalysisServer';
import { apiErrorResponse } from '@/lib/http/apiErrorResponse';
import { logError } from '@/lib/observability';
import { symbolSchema } from '@/domain/schemas';
import { AI_ANALYSIS_MODE_HEADER, parseRequestedMode } from '@/lib/aiAnalysisMode';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<Response> {
  let symbol: string | undefined;
  try {
    ({ symbol } = await params);

    const parsed = symbolSchema.safeParse(symbol);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid symbol parameter' },
        { status: 400 }
      );
    }

    // The client may request a mode via header; the server stays authoritative —
    // `resolveAiAnalysisMode` only honors it where override is permitted.
    const requestedMode = parseRequestedMode(req.headers.get(AI_ANALYSIS_MODE_HEADER));

    const iterator = analyzeAssetStream(symbol, { requestedMode })[Symbol.asyncIterator]();

    // Pull the first chunk eagerly: a pre-stream failure (missing config, an
    // invalid request, or a first-token upstream error) is wrapped as an
    // ExternalException here, so we can still map it to a proper JSON HTTP
    // status before any streaming headers are sent.
    const first = await iterator.next();

    const encoder = new TextEncoder();
    const symbolForLog = symbol;
    let cancelled = false;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        if (first.done) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(first.value));
      },
      async pull(controller) {
        try {
          const { value, done } = await iterator.next();
          if (cancelled) return;
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(encoder.encode(value));
        } catch (e) {
          if (cancelled) return;
          // Headers are already sent, so the status code can no longer change.
          // Error the stream instead — the client reader rejects rather than
          // receiving a silently truncated analysis.
          logError(e, { route: 'POST /api/ai-analysis (stream)', symbol: symbolForLog });
          controller.error(e);
        }
      },
      async cancel() {
        // Client disconnected — stop generation and release the upstream call.
        cancelled = true;
        await iterator.return?.();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return apiErrorResponse(e, { route: 'POST /api/ai-analysis', symbol });
  }
}

export const runtime = 'nodejs';
