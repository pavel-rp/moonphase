import { NextResponse } from 'next/server';
import { analyzeAsset } from '@/lib/data/aiAnalysisServer';
import { logError } from '@/lib/observability';
import { isExternalException } from '@/lib/errors';
import { symbolSchema } from '@/domain/schemas';

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

    const analysis = await analyzeAsset(symbol);

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (e) {
    logError(e, { route: 'POST /api/ai-analysis', symbol });
    if (isExternalException(e)) {
      const status = e.kind === 'RateLimited' ? 429 : e.kind === 'InvalidRequest' ? 400 : 502;
      return NextResponse.json(
        { error: e.message },
        { status }
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate analysis' },
      { status: 502 }
    );
  }
}

export const runtime = 'nodejs';
