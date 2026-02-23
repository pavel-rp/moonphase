import { NextResponse } from 'next/server';
import { analyzeAsset } from '@/lib/data/aiAnalysisServer';
import { logError } from '@/lib/observability';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<Response> {
  let symbol: string | undefined;
  try {
    ({ symbol } = await params);

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json(
        { error: 'Invalid symbol parameter' },
        { status: 400 }
      );
    }

    const analysis = await analyzeAsset(symbol);

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (e) {
    logError(e, { route: 'POST /api/ai-analysis', symbol });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate analysis' },
      { status: 502 }
    );
  }
}

export const runtime = 'nodejs';
