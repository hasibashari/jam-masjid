import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/shared/lib/db';
import { hashPassword } from '@/shared/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Lock down registration if there is already an admin account
    const userCount = await userDb.count();
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Pendaftaran dinonaktifkan. Pengguna admin sudah terdaftar.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { email, password } = body;

    // 3. Input Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password wajib diisi.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password minimal terdiri dari 8 karakter.' }, { status: 400 });
    }

    // 4. Create first admin user
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);

    const newUser = await userDb.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin'
      }
    });

    // 5. Exclude password hash from response
    const { password: _, ...userWithoutPassword } = newUser as any;

    return NextResponse.json({
      message: 'Admin berhasil didaftarkan.',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Gagal melakukan pendaftaran.' }, { status: 500 });
  }
}
