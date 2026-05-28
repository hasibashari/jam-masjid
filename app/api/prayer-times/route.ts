import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawLat = parseFloat(searchParams.get('lat') || '-6.2088');
    const rawLng = parseFloat(searchParams.get('lng') || '106.8456');
    const method = parseInt(searchParams.get('method') || '20'); 

    // Round coordinates to 4 decimal places (~11 meters precision)
    // This normalizes GPS jitter while preserving highly accurate calculations
    const lat = rawLat.toFixed(4);
    const lng = rawLng.toFixed(4);

    const defaultDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    const date = searchParams.get('date') || defaultDate;

    // Cache key incorporates normalized date, rounded lat/lng, and calculation method
    const cacheKey = `${date}_${lat}_${lng}_${method}`;

    // 1. Check SQLite Cache
    const cachedRow = db.prepare("SELECT * FROM PrayerTimesCache WHERE key = ?").get(cacheKey) as { key: string; value: string } | undefined;

    if (cachedRow) {
      console.log(`[Cache Hit] Serving prayer times from SQLite for key: ${cacheKey}`);
      try {
        const valueObj = JSON.parse(cachedRow.value);
        return NextResponse.json(valueObj);
      } catch (parseError) {
        console.error("Error parsing cached timings JSON, fetching fresh data", parseError);
        // Fallthrough to fetch again
      }
    }

    console.log(`[Cache Miss] Fetching fresh prayer times from AlAdhan API for key: ${cacheKey}`);
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    const res = await fetch(`https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${lat}&longitude=${lng}&method=${method}`);
    if (!res.ok) throw new Error(`AlAdhan API responded with status ${res.status}`);
    const apiData = await res.json();

    if (!apiData?.data?.timings || !apiData?.data?.meta?.timezone) {
      throw new Error("Invalid response structure from AlAdhan API");
    }

    // 2. Save entire data block to SQLite cache
    db.prepare("INSERT OR REPLACE INTO PrayerTimesCache (key, value) VALUES (?, ?)")
      .run(cacheKey, JSON.stringify(apiData.data));

    return NextResponse.json(apiData.data);
  } catch (error: any) {
    console.error("Failed to fetch or cache prayer times:", error);
    return NextResponse.json({ error: "Failed to fetch prayer times: " + error.message }, { status: 500 });
  }
}
