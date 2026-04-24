export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadToS3, extractTextFromPDF } from '@/lib/ocr';
import { extractDataFromText } from '@/lib/ai';
import { validateExtraction, normalizeExtraction } from '@/lib/validator';
import { calculatePrescriptionDate, getStatus, getDaysRemaining } from '@/lib/prescription';
import { sendMultaAnalysisEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const supabaseKey = await uploadToS3(buffer, file.name);

    // Extract text using Claude Vision API
    const text = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    // Extract data using Claude AI
    const extracted = await extractDataFromText(text);

    // Validate extraction
    const errors = validateExtraction(extracted);
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 },
      );
    }

    // Normalize data
    const normalized = normalizeExtraction(extracted);

    // Parse fecha ingreso to Date
    const fechaIngresoDate = new Date(normalized.fechaIngreso!);

    // Calculate prescription
    const fechaPrescripcion = calculatePrescriptionDate(fechaIngresoDate);
    const estado = getStatus(fechaIngresoDate);
    const diasRestantes = getDaysRemaining(fechaIngresoDate);

    // Create multa record
    const multa = await prisma.multa.create({
      data: {
        userId: session.user.id,
        rut: normalized.rut!,
        patente: normalized.patente!,
        monto: normalized.monto!,
        articulo: normalized.articulo,
        fechaIngreso: fechaIngresoDate,
        fechaPrescripcion,
        estado,
        diasRestantes,
        pdfOriginalUrl: supabaseKey,
      },
    });

    // Send email notification
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.email) {
      await sendMultaAnalysisEmail(user.email, normalized.rut!, normalized.patente!, estado);
    }

    return NextResponse.json({
      success: true,
      multa: {
        id: multa.id,
        rut: multa.rut,
        patente: multa.patente,
        monto: multa.monto,
        estado: multa.estado,
        diasRestantes: multa.diasRestantes,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
