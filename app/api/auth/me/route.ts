import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/shared/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('__Secure-Session')?.value;
    
    const session = verifySession(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'Sesi tidak valid atau telah kedaluwarsa.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role
      }
    });

  } catch (error: any) {
    console.error('API Auth Me error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
