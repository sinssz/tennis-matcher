import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint to verify database connection and environment
 */
export async function GET() {
  const envKeys = Object.keys(process.env).filter(key => 
    !key.includes('SECRET') && 
    !key.includes('PASSWORD') && 
    !key.includes('KEY') &&
    !key.includes('TOKEN') &&
    !key.includes('AUTH')
  );

  const checks = {
    status: 'unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'local',
    database: {
      connected: false,
      error: null as any,
    },
    env_diagnostics: {
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      DATABASE_URL_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      DATABASE_URL_starts_with: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : 'N/A',
      available_env_keys: envKeys,
    }
  };

  try {
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    checks.database.connected = true;
    checks.status = 'healthy';

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    console.error('Database connection test failed:', error);
    checks.database.connected = false;
    
    if (error instanceof Error) {
      checks.database.error = {
        message: error.message,
        name: error.name,
        // Prisma specific errors often have code or clientVersion
        code: (error as any).code,
        clientVersion: (error as any).clientVersion,
      };
    } else {
      checks.database.error = String(error);
    }
    
    checks.status = 'unhealthy';

    return NextResponse.json(checks, { status: 500 });
  }
}