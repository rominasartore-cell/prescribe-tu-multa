import { NextRequest, NextResponse } from 'next/server';

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

    // Registrar la solicitud en base de datos (simulado por ahora)
    console.log('Solicitud recibida:', {
      nombre,
      patente,
      email,
      telefono,
      timestamp: new Date().toISOString(),
    });

    // TODO: Guardar en base de datos cuando Prisma esté configurado
    // TODO: Enviar email de confirmación
    // TODO: Enviar notificación por WhatsApp si está configurado

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud recibida correctamente',
        id: Math.random().toString(36).substring(7),
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
