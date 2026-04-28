export const dynamic = 'force-dynamic';

import { getPrisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: name ?? null,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const err = error as any;

    console.error('REGISTER_ERROR', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      meta: err?.meta,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        error: 'REGISTER_ERROR',
        name: err?.name ?? 'UnknownError',
        message: err?.message ?? String(error),
        code: err?.code ?? null,
        meta: err?.meta ?? null,
      },
      { status: 500 },
    );
  }
}