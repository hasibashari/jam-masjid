import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '-6.2088'); // Jakarta default
  const lng = parseFloat(searchParams.get('lng') || '106.8456');
  // 20 is Kemenag (Kementerian Agama RI) default for Indonesia
  const method = parseInt(searchParams.get('method') || '20'); 
  const defaultDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  const date = searchParams.get('date') || defaultDate;
  
  // Format MM-DD-YYYY for AlAdhan or DD-MM-YYYY
  const [year, month, day] = date.split('-');
  const formattedDate = `${day}-${month}-${year}`;

  try {
    const res = await fetch(`https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${lat}&longitude=${lng}&method=${method}`);
    if (!res.ok) throw new Error("Failed to fetch from AlAdhan");
    const data = await res.json();
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("AlAdhan API error:", error);
    return NextResponse.json({ error: "Failed to fetch prayer times" }, { status: 500 });
  }
}
