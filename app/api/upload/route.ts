export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPrisma } from '@/lib/db';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET_NAME = 'certificados';

function normalizePatente(value: string) {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const oldFormat = cleaned.match(/^([A-Z]{2})(\d{4})$/);
  if (oldFormat) return `${oldFormat[1]}-${oldFormat[2]}`;

  const newFormat = cleaned.match(/^([A-Z]{4})(\d{2})$/);
  if (newFormat) return `${newFormat[1]}-${newFormat[2]}`;

  return value.toUpperCase().trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: 'STORAGE_CONFIG_ERROR',
          message: 'Faltan variables de Supabase Storage',
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();

    const nombre = String(formData.get('nombre') || '').trim();
    const patenteRaw = String(formData.get('patente') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const telefono = String(formData.get('telefono') || '').trim();
    const aceptaTerminosValue = String(formData.get('aceptaTerminos') || 'true');
    const file = formData.get('file') as File | null;

    const aceptaTerminos =
      aceptaTerminosValue === 'true' ||
      aceptaTerminosValue === 'on' ||
      aceptaTerminosValue === '1';

    const patente = normalizePatente(patenteRaw);

    if (!nombre || !patente || !email || !telefono || !file) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 },
      );
    }

    if (!aceptaTerminos) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos y condiciones' },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const phoneRegex = /^(\+?56)?[\s.-]?(9)?[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/;
    if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Teléfono chileno inválido' },
        { status: 400 },
      );
    }

    const patenteRegex = /^[A-Z]{2,3}-?\d{4}$|^[A-Z]{4}-?\d{2}$/;
    if (!patenteRegex.test(patente)) {
      return NextResponse.json({ error: 'Patente inválida' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo no puede superar los 10 MB' },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    const safePatente = patente.replace(/[^A-Z0-9-]/g, '');
    const timestamp = Date.now();
    const filePath = `${safePatente}/${timestamp}-${file.name.replace(/\s+/g, '-')}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('UPLOAD_STORAGE_ERROR', uploadError);
      return NextResponse.json(
        {
          error: 'UPLOAD_STORAGE_ERROR',
          message: uploadError.message,
        },
        { status: 500 },
      );
    }

    const pdfUrl = `${BUCKET_NAME}/${filePath}`;

    const prisma = await getPrisma();

    const solicitud = await prisma.solicitud.create({
      data: {
        nombre,
        patente,
        email,
        telefono,
        pdfUrl,
        aceptaTerminos,
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Certificado recibido correctamente',
        solicitudId: solicitud.id,
        pdfUrl,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const err = error as any;

    console.error('UPLOAD_ERROR', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      meta: err?.meta,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        error: 'UPLOAD_ERROR',
        name: err?.name ?? 'UnknownError',
        message: err?.message ?? String(error),
        code: err?.code ?? null,
        meta: err?.meta ?? null,
      },
      { status: 500 },
    );
  }
}