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

    console.log(`[Upload] User ${session.user.id} uploading file: ${file.name} (${file.size} bytes)`);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    console.log(`[Upload] Uploading to Supabase Storage...`);
    let supabaseKey: string;
    try {
      supabaseKey = await uploadToS3(buffer, file.name);
      console.log(`[Upload] File uploaded successfully: ${supabaseKey}`);
    } catch (uploadError) {
      console.error('[Upload] Supabase upload failed:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage', details: uploadError instanceof Error ? uploadError.message : 'Unknown error' },
        { status: 500 },
      );
    }

    // Extract text using pdf-parse
    console.log(`[Upload] Extracting text from PDF...`);
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
      if (!text || text.trim().length === 0) {
        console.warn('[Upload] No text extracted from PDF');
        return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
      }
      console.log(`[Upload] Text extracted successfully (${text.length} chars)`);
    } catch (extractError) {
      console.error('[Upload] Text extraction failed:', extractError);
      return NextResponse.json(
        { error: 'Failed to extract text from PDF', details: extractError instanceof Error ? extractError.message : 'Unknown error' },
        { status: 500 },
      );
    }

    // Extract data using Claude AI
    console.log(`[Upload] Analyzing with Claude AI...`);
    let extracted: any;
    try {
      extracted = await extractDataFromText(text);
      console.log('[Upload] Claude analysis completed');
    } catch (aiError) {
      console.error('[Upload] Claude AI analysis failed:', aiError);
      return NextResponse.json(
        { error: 'Failed to analyze PDF', details: aiError instanceof Error ? aiError.message : 'Unknown error' },
        { status: 500 },
      );
    }

    // Validate extraction
    const errors = validateExtraction(extracted);
    if (errors.length > 0) {
      console.warn('[Upload] Validation failed:', errors);
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
    console.log('[Upload] Data normalized successfully');

    // Parse fecha ingreso to Date
    const fechaIngresoDate = new Date(normalized.fechaIngreso!);

    // Calculate prescription
    const fechaPrescripcion = calculatePrescriptionDate(fechaIngresoDate);
    const estado = getStatus(fechaIngresoDate);
    const diasRestantes = getDaysRemaining(fechaIngresoDate);

    // Create multa record
    console.log(`[Upload] Creating Multa record for user ${session.user.id}...`);
    let multa: any;
    try {
      multa = await prisma.multa.create({
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
      console.log(`[Upload] Multa created successfully: ${multa.id}`);
    } catch (dbError) {
      console.error('[Upload] Database creation failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to save multa to database', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 },
      );
    }

    // Send email notification
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.email) {
      try {
        await sendMultaAnalysisEmail(user.email, normalized.rut!, normalized.patente!, estado);
        console.log(`[Upload] Email sent to ${user.email}`);
      } catch (emailError) {
        console.warn('[Upload] Email sending failed:', emailError);
        // Don't fail the upload if email fails
      }
    }

    console.log(`[Upload] Upload process completed successfully for user ${session.user.id}`);
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
    console.error('[Upload] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage, stack: errorStack },
      { status: 500 },
    );
  }
}
