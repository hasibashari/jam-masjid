import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      message: 'Berhasil keluar (logout).'
    });

    // Invalidate cookie by setting max-age to 0
    response.headers.set(
      'Set-Cookie',
      `__Secure-Session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    );

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat keluar.' },
      { status: 500 }
    );
  }
}
