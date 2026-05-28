import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 3) {
      return NextResponse.json([]);
    }

    const encodedQuery = encodeURIComponent(query.trim());
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&countrycodes=id&limit=5`;

    // Strict compliance with OSM Nominatim Usage Policy (attaching a custom User-Agent)
    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'JamMasjidDigital/1.0 (contact: admin@jammasjid.id; hasibashari/jam-masjid)',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!res.ok) {
      throw new Error(`Nominatim API responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Location search proxy error:", error);
    return NextResponse.json({ error: "Failed to search location: " + error.message }, { status: 500 });
  }
}
