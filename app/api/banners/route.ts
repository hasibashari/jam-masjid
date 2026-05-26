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

  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // If the database has no banners at all (unseeded), return the mock fallback banners
    if (banners.length === 0) {
      return NextResponse.json(getAll ? FALLBACK_BANNERS : FALLBACK_BANNERS.filter(b => b.active));
    }
    
    if (getAll) {
      return NextResponse.json(banners);
    }
    
    return NextResponse.json(banners.filter(b => b.active));
  } catch (error) {
    console.error("Failed to fetch banners", error);
    return NextResponse.json(FALLBACK_BANNERS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, imageUrl, description, active, autoHideAfter } = body;

    // Enforce required fields ONLY on creation
    if (!id && (!title || !imageUrl)) {
      return NextResponse.json({ error: "Title and Image URL are required for new banners" }, { status: 400 });
    }

    let result;
    if (id) {
      // Safe partial Update: only pass values that are defined to avoid writing NULL/undefined to NOT NULL columns
      const data: any = {};
      if (title !== undefined) data.title = title;
      if (imageUrl !== undefined) data.imageUrl = imageUrl;
      if (description !== undefined) data.description = description;
      if (active !== undefined) data.active = Boolean(active);
      if (autoHideAfter !== undefined) data.autoHideAfter = parseInt(autoHideAfter);

      result = await prisma.banner.update({
        where: { id },
        data
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

    await prisma.banner.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete: " + error.message }, { status: 500 });
  }
}
