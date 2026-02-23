import { NextResponse } from 'next/server';
import { fetchAssets } from '@/lib/data/assets';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? '19');
  const offset = Number(searchParams.get('offset') ?? '0');

  try {
    const assets = await fetchAssets({ limit, offset });
    return NextResponse.json(assets, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 });
  }
}

export const revalidate = 60;
export const runtime = 'nodejs';