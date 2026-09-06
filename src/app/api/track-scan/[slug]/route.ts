import { NextResponse } from 'next/server';

const recentScansMap = new Map<string, number>();

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

    const now = Date.now();
    const lastScanTime = recentScansMap.get(slug);

    if (lastScanTime && now - lastScanTime < 10000) {
      return NextResponse.json({ message: 'Scan debounced', recorded: false });
    }

    recentScansMap.set(slug, now);

    if (recentScansMap.size > 100) {
      for (const [k, v] of recentScansMap.entries()) {
        if (now - v > 60000) {
          recentScansMap.delete(k);
        }
      }
    }

    // Return success response to the client
    return NextResponse.json({
      success: true,
      recorded: true,
      slug,
      source,
    });
  } catch (error) {
    console.error('Scan tracking error:', error);
    return NextResponse.json({ success: false, error: 'Internal tracking error' }, { status: 500 });
  }
}
