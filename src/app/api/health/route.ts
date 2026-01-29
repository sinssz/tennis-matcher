import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint to verify database connection
 */
export async function GET() {
  const checks = {
    status: 'unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      connected: false,
      error: null as string | null,
    },
    env: {
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      DATABASE_URL_preview: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 30) + '...'
        : 'NOT_SET',
    },
  };

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    checks.database.connected = true;
    checks.status = 'healthy';

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    checks.database.connected = false;
    checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    checks.status = 'unhealthy';

    // More specific error messages
    if (!process.env.DATABASE_URL) {
      checks.database.error =
        'DATABASE_URL environment variable is not set. Please configure it in Vercel settings.';
    }

    return NextResponse.json(checks, { status: 500 });
  }
}
