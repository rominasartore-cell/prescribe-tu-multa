import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const multas = await prisma.multa.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        rut: true,
        patente: true,
        monto: true,
        estado: true,
        diasRestantes: true,
        pagado: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      multas,
    });
  } catch (error) {
    console.error('Get multas error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
