import { prisma } from '@/lib/db';
import { updateEventSchema } from '@/lib/validations';
import {
  ApiResponse,
  EventWithDetails,
  ParticipantInfo,
  MatchWithPlayers,
  PlayerInfo,
} from '@/types';
import { Event } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * GET /api/events/[id]
 * Fetch event details with participants and matches
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Fetch event with participants and matches
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            player: true,
          },
        },
        matches: {
          include: {
            players: {
              include: {
                player: true,
              },
            },
          },
          orderBy: [{ roundNumber: 'asc' }, { courtNumber: 'asc' }],
        },
      },
    });

    if (!event) {
      const response: ApiResponse<null> = {
        error: '이벤트를 찾을 수 없습니다',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Transform to EventWithDetails format
    const participants: ParticipantInfo[] = event.participants.map((ep) => ({
      id: ep.id,
      playerId: ep.playerId,
      playerName: ep.player.name,
      gender: ep.player.gender,
      level: ep.player.level,
      gamesPlayed: ep.gamesPlayed,
    }));

    const matches: MatchWithPlayers[] = event.matches.map((match) => {
      const team1Players: PlayerInfo[] = [];
      const team2Players: PlayerInfo[] = [];

      match.players.forEach((mp) => {
        const playerInfo: PlayerInfo = {
          id: mp.player.id,
          name: mp.player.name,
          gender: mp.player.gender,
          level: mp.player.level,
        };

        if (mp.team === 1) {
          team1Players.push(playerInfo);
        } else {
          team2Players.push(playerInfo);
        }
      });

      return {
        id: match.id,
        roundNumber: match.roundNumber,
        courtNumber: match.courtNumber,
        matchType: match.matchType,
        status: match.status,
        team1Score: match.team1Score,
        team2Score: match.team2Score,
        team1: team1Players,
        team2: team2Players,
      };
    });

    const eventWithDetails: EventWithDetails = {
      id: event.id,
      name: event.name,
      date: event.date,
      status: event.status,
      totalRounds: event.totalRounds,
      participants,
      matches,
    };

    const response: ApiResponse<EventWithDetails> = {
      data: eventWithDetails,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to fetch event',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/events/[id]
 * Update event details
 * Body: { name?: string, date?: string, status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' }
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate request body using Zod schema
    const validatedData = updateEventSchema.parse(body);

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      const response: ApiResponse<null> = {
        error: '이벤트를 찾을 수 없습니다',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update event in database
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: validatedData,
    });

    const response: ApiResponse<Event> = {
      data: updatedEvent,
      message: '이벤트가 성공적으로 수정되었습니다',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message || 'Invalid input';
      const response: ApiResponse<null> = {
        error: message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Error updating event:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to update event',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event (cascades to participants and matches)
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      const response: ApiResponse<null> = {
        error: '이벤트를 찾을 수 없습니다',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete event (cascade will handle related data)
    await prisma.event.delete({
      where: { id },
    });

    const response: ApiResponse<null> = {
      message: '이벤트가 성공적으로 삭제되었습니다',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to delete event',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
