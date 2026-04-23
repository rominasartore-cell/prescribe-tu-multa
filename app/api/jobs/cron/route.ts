import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationsJob } from '@/jobs/send-notifications';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = request.nextUrl.searchParams.get('job');

    if (!job) {
      return NextResponse.json({ error: 'Job parameter required' }, { status: 400 });
    }

    if (job === 'send-notifications') {
      await sendNotificationsJob();
      return NextResponse.json({
        success: true,
        job: 'send-notifications',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Unknown job' }, { status: 400 });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
