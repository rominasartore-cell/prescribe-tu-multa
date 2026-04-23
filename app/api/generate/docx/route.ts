import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateDocx } from '@/lib/docx-generator';
import { Packer } from 'docx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const multaId = searchParams.get('multaId');

    if (!multaId) {
      return NextResponse.json({ error: 'multaId required' }, { status: 400 });
    }

    const multa = await prisma.multa.findUnique({
      where: { id: multaId },
    });

    if (!multa) {
      return NextResponse.json({ error: 'Multa not found' }, { status: 404 });
    }

    // Check ownership
    if (multa.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if paid
    if (!multa.pagado) {
      return NextResponse.json(
        { error: 'Please purchase documents first' },
        { status: 403 },
      );
    }

    // Generate DOCX
    const doc = generateDocx({
      rut: multa.rut,
      patente: multa.patente,
      monto: multa.monto,
      articulo: multa.articulo || undefined,
      fechaIngreso: multa.fechaIngreso,
      fechaPrescripcion: multa.fechaPrescripcion,
      estado: multa.estado as 'PRESCRITA' | 'VIGENTE',
      diasRestantes: multa.diasRestantes || 0,
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), {
      headers: {
        'Content-Disposition': `attachment; filename="escrito-judicial-${multa.rut}.docx"`,
      },
    });
  } catch (error) {
    console.error('DOCX generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
