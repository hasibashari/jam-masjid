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
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(FALLBACK_ANNOUNCEMENTS);
  }

  try {
    const data = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No DATABASE_URL configured. DB is read-only." }, { status: 400 });
    }

    let result;
    if (id) {
      // Update
      result = await prisma.announcement.update({
        where: { id },
        data: {
          text: text !== undefined ? text : undefined,
          active: active !== undefined ? Boolean(active) : undefined,
        },
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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No DATABASE_URL configured. DB is read-only." }, { status: 400 });
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
