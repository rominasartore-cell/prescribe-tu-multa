export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPaymentPreference } from '@/lib/mercado-pago';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { multaId } = await request.json();

    if (!multaId) {
      return NextResponse.json({ error: 'multaId required' }, { status: 400 });
    }

    // Get multa and verify ownership
    const multa = await prisma.multa.findUnique({
      where: { id: multaId },
    });

    if (!multa) {
      return NextResponse.json({ error: 'Multa not found' }, { status: 404 });
    }

    if (multa.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already paid
    if (multa.pagado) {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    // Create or get payment record
    let pago = await prisma.pago.findUnique({
      where: { multaId },
    });

    if (!pago) {
      pago = await prisma.pago.create({
        data: {
          multaId,
          userId: session.user.id,
          monto: 19990,
          estado: 'PENDIENTE',
        },
      });
    }

    // Create Mercado Pago preference
    const preference = await createPaymentPreference(
      multaId,
      session.user.id,
      session.user.email,
    );

    return NextResponse.json({
      success: true,
      preference,
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
