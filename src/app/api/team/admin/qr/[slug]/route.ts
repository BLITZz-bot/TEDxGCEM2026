import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const host = request.headers.get('host') || 'tedxgcem.in';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    const profileUrl = `${protocol}://${host}/team/${slug}?src=qr`;
    const format = url.searchParams.get('format') || 'png';

    if (format === 'svg') {
      const svgString = await QRCode.toString(profileUrl, {
        type: 'svg',
        color: {
          dark: '#EB0028',
          light: '#FFFFFF',
        },
        margin: 2,
        width: 400,
      });

      return new NextResponse(svgString, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="tedx-qr-${slug}.svg"`,
        },
      });
    }

    const qrBuffer = await QRCode.toBuffer(profileUrl, {
      type: 'png',
      color: {
        dark: '#EB0028',
        light: '#FFFFFF',
      },
      margin: 2,
      width: 600,
    });

    return new NextResponse(new Uint8Array(qrBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="tedx-qr-${slug}.png"`,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
