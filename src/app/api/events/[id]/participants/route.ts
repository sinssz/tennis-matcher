import { prisma } from '@/lib/db';
import { addParticipantsSchema } from '@/lib/validations';
import { ApiResponse, ParticipantInfo } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * POST /api/events/[id]/participants
 * Add participants to an event
 * Body: { playerIds: string[] }
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate request body using Zod schema
    const validatedData = addParticipantsSchema.parse(body);

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      const response: ApiResponse<null> = {
        error: '이벤트를 찾을 수 없습니다',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verify all players exist
    const players = await prisma.player.findMany({
      where: {
        id: {
          in: validatedData.playerIds,
        },
      },
    });

    if (players.length !== validatedData.playerIds.length) {
      const response: ApiResponse<null> = {
        error: '존재하지 않는 참가자가 있습니다',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get existing participants to skip duplicates
    const existingParticipants = await prisma.eventParticipant.findMany({
      where: {
        eventId: id,
        playerId: {
          in: validatedData.playerIds,
        },
      },
    });

    const existingPlayerIds = new Set(existingParticipants.map((p) => p.playerId));

    // Filter out duplicates
    const newPlayerIds = validatedData.playerIds.filter(
      (playerId) => !existingPlayerIds.has(playerId)
    );

    if (newPlayerIds.length === 0) {
      const response: ApiResponse<null> = {
        error: '모두 이미 참가자입니다',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create new participants
    const createdParticipants = await prisma.eventParticipant.createMany({
      data: newPlayerIds.map((playerId) => ({
        eventId: id,
        playerId,
      })),
    });

    // Fetch created participants with player details
    const participants = await prisma.eventParticipant.findMany({
      where: {
        eventId: id,
        playerId: {
          in: newPlayerIds,
        },
      },
      include: {
        player: true,
      },
    });

    const participantInfos: ParticipantInfo[] = participants.map((ep) => ({
      id: ep.id,
      playerId: ep.playerId,
      playerName: ep.player.name,
      gender: ep.player.gender,
      level: ep.player.level,
      gamesPlayed: ep.gamesPlayed,
    }));

    const response: ApiResponse<ParticipantInfo[]> = {
      data: participantInfos,
      message: `${createdParticipants.count}명의 참가자가 추가되었습니다`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message || 'Invalid input';
      const response: ApiResponse<null> = {
        error: message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Error adding participants:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to add participants',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
