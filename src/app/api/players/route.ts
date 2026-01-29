import { prisma } from '@/lib/db';
import { createPlayerSchema } from '@/lib/validations';
import { ApiResponse } from '@/types';
import { Player } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * GET /api/players
 * Fetch all players with optional filtering
 * Query parameters:
 *   - isActive: boolean (optional) - Filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    // Build query filters
    const where: { isActive?: boolean } = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Fetch players from database
    const players = await prisma.player.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const response: ApiResponse<Player[]> = {
      data: players,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching players:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to fetch players',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/players
 * Create a new player
 * Body: { name: string, gender: 'MALE' | 'FEMALE', level: 'A' | 'B' | 'C' | 'D' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Zod schema
    const validatedData = createPlayerSchema.parse(body);

    // Create player in database
    const player = await prisma.player.create({
      data: validatedData,
    });

    const response: ApiResponse<Player> = {
      data: player,
      message: '참가자가 성공적으로 생성되었습니다',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const response: ApiResponse<null> = {
        error: error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Error creating player:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to create player',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
