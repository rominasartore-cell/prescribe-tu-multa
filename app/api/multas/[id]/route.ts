import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const multa = await prisma.multa.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        rut: true,
        patente: true,
        monto: true,
        articulo: true,
        fechaIngreso: true,
        fechaPrescripcion: true,
        estado: true,
        diasRestantes: true,
        pagado: true,
        documentoPdfUrl: true,
        documentoDocxUrl: true,
        userId: true,
      },
    });

    if (!multa) {
      return NextResponse.json({ error: 'Multa not found' }, { status: 404 });
    }

    // Check ownership
    if (multa.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      multa,
    });
  } catch (error) {
    console.error('Get multa error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
