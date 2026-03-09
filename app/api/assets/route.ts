import { NextResponse } from 'next/server';
import { fetchAssets } from '@/lib/data/assets';
import { apiErrorResponse } from '@/lib/http/apiErrorResponse';
import { COINCAP_DEFAULT_LIMIT } from '@/lib/config';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? String(COINCAP_DEFAULT_LIMIT));
  const offset = Number(searchParams.get('offset') ?? '0');

  try {
    const assets = await fetchAssets({ limit, offset });
    return NextResponse.json(assets, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e, { route: 'GET /api/assets', limit, offset });
  }
}

// Must be a static literal for Next.js segment config — matches COINCAP_REVALIDATE_S
export const revalidate = 60;
export const runtime = 'nodejs';