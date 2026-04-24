import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationsJob } from '@/jobs/send-notifications';
import { processSolicitudJob } from '@/jobs/process-solicitud';
import { getPrisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    if (job === 'process-solicitudes') {
      const prisma = await getPrisma();

      // Find all pending solicitudes that are ready to process
      const solicitudes = await prisma.solicitud.findMany({
        where: {
          estado: 'PENDIENTE',
          OR: [
            { proximoIntento: null },
            { proximoIntento: { lte: new Date() } },
          ],
        },
        take: 10, // Process max 10 at a time
      });

      let processed = 0;
      let failed = 0;

      for (const solicitud of solicitudes) {
        try {
          await processSolicitudJob(solicitud.id);
          processed++;
        } catch (error) {
          console.error(`Failed to process solicitud ${solicitud.id}:`, error);
          failed++;
        }
      }

      return NextResponse.json({
        success: true,
        job: 'process-solicitudes',
        processed,
        failed,
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
