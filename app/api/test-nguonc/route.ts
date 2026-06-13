import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://phim.nguonc.com/api/film/ngoi-truong-xac-song';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: `HTTP Error ${response.status}`, statusText: response.statusText });
    }
    
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
