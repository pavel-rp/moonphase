import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchAssets } from '@/lib/data/assets';
import { apiErrorResponse } from '@/lib/http/apiErrorResponse';
import { ASSETS_API_MAX_LIMIT, COINCAP_DEFAULT_LIMIT } from '@/lib/config';

const pageSchema = z.object({
  limit: z.coerce.number().int().min(1).max(ASSETS_API_MAX_LIMIT).default(COINCAP_DEFAULT_LIMIT),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const parsed = pageSchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: `limit must be an integer from 1 to ${ASSETS_API_MAX_LIMIT}, offset a non-negative integer` },
      { status: 400 }
    );
  }
  const { limit, offset } = parsed.data;

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
