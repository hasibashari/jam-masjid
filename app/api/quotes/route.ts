import { NextRequest, NextResponse } from 'next/server';
import { quotesDb } from '@/shared/lib/db';
import { QuoteType } from '@/shared/types';

export const dynamic = 'force-dynamic';

const FALLBACK_QUOTES: QuoteType[] = [
  { id: '1', text: "Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.", source: "QS. Al-Ankabut: 45", active: true },
  { id: '2', text: "Shalat berjamaah lebih utama daripada shalat sendirian sebanyak dua puluh tujuh derajat.", source: "HR. Bukhari & Muslim", active: true },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const getAll = searchParams.get('all') === 'true';

  try {
    const data = await quotesDb.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (data.length === 0) {
      return NextResponse.json(getAll ? FALLBACK_QUOTES : FALLBACK_QUOTES.filter(q => q.active));
    }

    if (getAll) {
      return NextResponse.json(data);
    }

    return NextResponse.json(data.filter((q: QuoteType) => q.active));
  } catch (error) {
    console.error("DB Error retrieving quotes:", error);
    return NextResponse.json(FALLBACK_QUOTES);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, text, source, active } = body;

    if (!text && !id) {
      return NextResponse.json({ error: "Missing quote text or id" }, { status: 400 });
    }

    let result;
    if (id) {
      const data: any = {};
      if (text !== undefined) data.text = text;
      if (source !== undefined) data.source = source;
      if (active !== undefined) data.active = Boolean(active);

      result = await quotesDb.update({
        where: { id },
        data,
      });
    } else {
      result = await quotesDb.create({
        data: {
          text,
          source: source || 'Hamba Allah',
          active: active !== undefined ? Boolean(active) : true,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating/updating quote:", error);
    return NextResponse.json({ error: "Database operation failed: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing quote ID" }, { status: 400 });
    }

    await quotesDb.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ error: "Failed to delete: " + error.message }, { status: 500 });
  }
}
