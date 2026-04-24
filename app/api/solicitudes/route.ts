import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { nombre, patente, email, telefono, aceptaTerminos } = body;

    // Validaciones básicas
    if (!nombre || !patente || !email || !telefono || !aceptaTerminos) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar teléfono (formato chileno)
    const phoneRegex = /^(\+?56)?[\s.-]?(9)?[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/;
    if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Teléfono chileno inválido' },
        { status: 400 }
      );
    }

    // Validar patente
    const patenteRegex = /^[A-Z]{2,3}-?\d{4}$|^[A-Z]{4}-?\d{2}$/;
    if (!patenteRegex.test(patente)) {
      return NextResponse.json(
        { error: 'Patente inválida' },
        { status: 400 }
      );
    }

    // Guardar en base de datos
    const prisma = await getPrisma();
    const solicitud = await prisma.solicitud.create({
      data: {
        nombre,
        patente,
        email,
        telefono,
        aceptaTerminos,
        estado: 'PENDIENTE',
      },
    });

    console.log('Solicitud creada:', solicitud.id);

    // TODO: Enviar email de confirmación
    // TODO: Enviar notificación por WhatsApp si está configurado
    // TODO: Procesar PDF con AWS Textract + Claude API

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud recibida correctamente',
        id: solicitud.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en solicitud:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
