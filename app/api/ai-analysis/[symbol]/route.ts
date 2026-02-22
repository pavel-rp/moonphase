import { NextResponse } from 'next/server';
import { analyzeAsset } from '@/lib/data/aiAnalysisServer';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<Response> {
  try {
    const { symbol } = await params;

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json(
        { error: 'Invalid symbol parameter' },
        { status: 400 }
      );
    }

    const analysis = await analyzeAsset(symbol);

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (e) {
    console.error('AI Analysis error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate analysis' },
      { status: 502 }
    );
  }
}

export const runtime = 'nodejs';
