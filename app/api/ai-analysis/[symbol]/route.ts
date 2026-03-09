import { NextResponse } from 'next/server';
import { analyzeAsset } from '@/lib/data/aiAnalysisServer';
import { apiErrorResponse } from '@/lib/http/apiErrorResponse';
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
    return apiErrorResponse(e, { route: 'POST /api/ai-analysis', symbol });
  }
}

export const runtime = 'nodejs';
