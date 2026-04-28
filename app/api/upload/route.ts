import { NextResponse } from 'next/server';

// DEPRECATED: Use /api/solicitudes instead for public submissions
export async function POST() {
  console.log('[Upload] Deprecated endpoint - please use /api/solicitudes');

  return NextResponse.json(
    {
      error: 'Endpoint deprecated',
      message: 'Please use /api/solicitudes instead',
      details: 'This endpoint is no longer maintained. Submit your certificate using POST /api/solicitudes',
    },
    { status: 301 }
  );
}
