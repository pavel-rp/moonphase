import { NextResponse } from 'next/server';
import { fetchAssets } from '@/lib/data/assets';
import { logError } from '@/lib/observability';
import { isExternalException } from '@/lib/errors';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? '19');
  const offset = Number(searchParams.get('offset') ?? '0');

  try {
    const assets = await fetchAssets({ limit, offset });
    return NextResponse.json(assets, { status: 200 });
  } catch (e) {
    logError(e, { route: 'GET /api/assets', limit, offset });
    if (isExternalException(e)) {
      const status = e.kind === 'RateLimited' ? 429 : e.kind === 'InvalidRequest' ? 400 : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 });
  }
}

export const revalidate = 60;
export const runtime = 'nodejs';