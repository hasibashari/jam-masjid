import { NextRequest, NextResponse } from 'next/server';
import { getAnnouncementsService } from '@/features/announcements/services/getAnnouncements';
import { prisma } from '@/shared/lib/db';
import { FALLBACK_ANNOUNCEMENTS } from '@/shared/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const getAll = searchParams.get('all') === 'true';

  if (!getAll) {
    const data = await getAnnouncementsService();
    return NextResponse.json(data);
  }

  // Admin wants ALL announcements (active & inactive)
  try {
    const data = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // If the database is completely empty (unseeded), show fallback announcements for demo
    if (data.length === 0) {
      return NextResponse.json(FALLBACK_ANNOUNCEMENTS);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("DB Error retrieving all announcements:", error);
    return NextResponse.json(FALLBACK_ANNOUNCEMENTS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, text, active } = body;

    if (!text && !id) {
      return NextResponse.json({ error: "Missing announcement text or id" }, { status: 400 });
    }

    let result;
    if (id) {
      // Safe partial Update: only pass values that are defined to avoid writing NULL/undefined to NOT NULL columns
      const data: any = {};
      if (text !== undefined) data.text = text;
      if (active !== undefined) data.active = Boolean(active);

      result = await prisma.announcement.update({
        where: { id },
        data,
      });
    } else {
      // Create
      result = await prisma.announcement.create({
        data: {
          text,
          active: active !== undefined ? Boolean(active) : true,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating/updating announcement:", error);
    return NextResponse.json({ error: "Database operation failed: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json({ error: "Failed to delete: " + error.message }, { status: 500 });
  }
}
