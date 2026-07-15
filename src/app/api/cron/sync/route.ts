import { NextResponse } from 'next/server';
import { runScheduler } from '@/lib/engine/Scheduler';

export async function GET(req: Request) {
  // Validate cron secret if provided via Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Run the scheduler synchronously for Vercel Cron
    await runScheduler();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error running scheduler via cron:', error);
    return NextResponse.json({ error: 'Failed to run scheduler' }, { status: 500 });
  }
}
