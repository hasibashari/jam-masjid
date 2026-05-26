import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db';
import { BannerType } from '@/shared/types';

export const dynamic = 'force-dynamic';

const FALLBACK_BANNERS: BannerType[] = [
  {
    id: 'b1',
    title: 'Pengajian Rutin Pekanan',
    description: 'Setiap hari Sabtu Ba\'da Maghrib bersama KH. Ahmad Dahlan dengan pembahasan Tafsir Al-Quran.',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200',
    active: true,
    autoHideAfter: 15,
  },
  {
    id: 'b2',
    title: 'Donasi Renovasi Tempat Wudhu',
    description: 'Mari berinfaq untuk Renovasi area Wudhu jamaah wanita. Salurkan donasi Anda melalui Rekening Masjid.',
    imageUrl: 'https://images.unsplash.com/photo-1597935258735-e254c1839512?q=80&w=1200',
    active: true,
    autoHideAfter: 15,
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const getAll = searchParams.get('all') === 'true';

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(getAll ? FALLBACK_BANNERS : FALLBACK_BANNERS.filter(b => b.active));
  }

  try {
    const banners = await prisma.banner.findMany({
      where: getAll ? undefined : { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Fallback if empty
    if (!getAll && banners.length === 0) {
      return NextResponse.json(FALLBACK_BANNERS);
    }
    
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Failed to fetch banners", error);
    return NextResponse.json(FALLBACK_BANNERS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, imageUrl, description, active, autoHideAfter } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and Image URL are required" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No DATABASE_URL configured. DB is read-only." }, { status: 400 });
    }

    let result;
    if (id) {
      // Update
      result = await prisma.banner.update({
        where: { id },
        data: {
          title,
          imageUrl,
          description: description ?? "",
          active: active !== undefined ? Boolean(active) : undefined,
          autoHideAfter: autoHideAfter !== undefined ? parseInt(autoHideAfter) : undefined
        }
      });
    } else {
      // Create
      result = await prisma.banner.create({
        data: {
          title,
          imageUrl,
          description: description ?? "",
          active: active !== undefined ? Boolean(active) : true,
          autoHideAfter: autoHideAfter !== undefined ? parseInt(autoHideAfter) : 15
        }
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error saving banner:", error);
    return NextResponse.json({ error: "Database operation failed: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing banner ID" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No DATABASE_URL configured. DB is read-only." }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete: " + error.message }, { status: 500 });
  }
}
