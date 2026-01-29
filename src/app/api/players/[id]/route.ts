import { prisma } from '@/lib/db';
import { updatePlayerSchema } from '@/lib/validations';
import { ApiResponse } from '@/types';
import { Player } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * GET /api/players/[id]
 * Fetch a specific player by ID
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Validate ID format (CUID format)
    if (!id || typeof id !== 'string' || id.length === 0) {
      const response: ApiResponse<null> = {
        error: '유효한 참가자 ID가 필요합니다',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Fetch player from database
    const player = await prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      const response: ApiResponse<null> = {
        error: '참가자를 찾을 수 없습니다',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Player> = {
      data: player,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching player:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to fetch player',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/players/[id]
 * Update a player
 * Body: { name?: string, gender?: 'MALE' | 'FEMALE', level?: 'A' | 'B' | 'C' | 'D', isActive?: boolean }
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      const response: ApiResponse<null> = {
        error: '유효한 참가자 ID가 필요합니다',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    // Validate request body using Zod schema (partial schema)
    const validatedData = updatePlayerSchema.parse(body);

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      const response: ApiResponse<null> = {
        error: '참가자를 찾을 수 없습니다',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update player in database
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: validatedData,
    });

    const response: ApiResponse<Player> = {
      data: updatedPlayer,
      message: '참가자가 성공적으로 수정되었습니다',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      const response: ApiResponse<null> = {
        error: error.issues[0]?.message || 'Invalid input',
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Error updating player:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to update player',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/players/[id]
 * Delete a player
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      const response: ApiResponse<null> = {
        error: '유효한 참가자 ID가 필요합니다',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      const response: ApiResponse<null> = {
        error: '참가자를 찾을 수 없습니다',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete player from database
    await prisma.player.delete({
      where: { id },
    });

    const response: ApiResponse<null> = {
      message: '참가자가 성공적으로 삭제되었습니다',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error deleting player:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to delete player',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
