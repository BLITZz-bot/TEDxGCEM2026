import { NextResponse } from 'next/server';
import { recordScan } from '@/lib/team-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const url = new URL(request.url);
    const source = url.searchParams.get('src') || 'direct-link';

    const result = await recordScan(slug, source);

    if (result.debounced) {
      return NextResponse.json({ message: 'Scan debounced', recorded: false });
    }

    if (!result.recorded) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, recorded: true, slug, source });
  } catch (error) {
    console.error('Scan tracking error:', error);
    return NextResponse.json({ success: false, error: 'Internal tracking error' }, { status: 500 });
  }
}
