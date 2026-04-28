import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Solicitud] Deprecated endpoint - redirecting to /api/upload');

  return NextResponse.json(
    {
      error: 'Endpoint deprecated',
      message: 'Please use /api/upload instead',
      details: 'This endpoint is no longer maintained. Submit your certificate using POST /api/upload',
    },
    { status: 301 }
  );
}
