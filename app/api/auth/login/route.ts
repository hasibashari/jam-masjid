import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/shared/lib/db';
import { verifyPassword, signSession } from '@/shared/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // 2. Lookup user
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userDb.findByEmail(normalizedEmail) as any;

    if (!user) {
      // Prevent account enumeration: return generic error and same latency
      return NextResponse.json(
        { error: 'Email atau password tidak valid.' },
        { status: 401 }
      );
    }

    // 3. Verify password hash using timing-safe scrypt
    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password tidak valid.' },
        { status: 401 }
      );
    }

    // 4. Generate signed session token (expires in 24 hours)
    const expTime = Date.now() + 24 * 60 * 60 * 1000;
    const sessionToken = signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: expTime
    });

    // 5. Build hardened cookie response
    const { password: _, ...userWithoutPassword } = user as any;
    const response = NextResponse.json({
      message: 'Login berhasil.',
      user: userWithoutPassword
    });

    // __Secure- prefix requires Secure attribute, valid on localhost and HTTPS
    response.headers.set(
      'Set-Cookie',
      `__Secure-Session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
    );

    return response;

  } catch (error: any) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat masuk.' },
      { status: 500 }
    );
  }
}
