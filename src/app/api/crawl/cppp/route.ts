import { NextResponse } from 'next/server';
import { scrapeCPPP } from '@/lib/crawlers/cppp-crawler';

export async function GET(req: Request) {
  try {
    await scrapeCPPP();
    return NextResponse.json({ success: true, message: 'CPPP scrape completed' });
  } catch (error) {
    console.error('Error running CPPP crawler:', error);
    return NextResponse.json({ error: 'Failed to run CPPP crawler' }, { status: 500 });
  }
}
