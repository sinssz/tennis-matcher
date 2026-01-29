import { prisma } from '@/lib/db';
import { generateRound } from '@/algorithm/generator';
import { ApiResponse } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { getMatchHistory, getGamesPlayedMap } from '@/algorithm/utils';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { courtNumber } = body;

    if (!courtNumber || courtNumber <= 0) {
      const response: ApiResponse<null> = {
        error: '유효한 코트 번호를 입력해주세요.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const eventId = params.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          include: {
            player: true,
          },
        },
        matches: {
          include: {
            players: true,
          },
          orderBy: [{ roundNumber: 'asc' }, { courtNumber: 'asc' }],
        },
      },
    });

    if (!event) {
      const response: ApiResponse<null> = {
        error: '이벤트를 찾을 수 없습니다.',
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (event.status !== 'ACTIVE') {
      const response: ApiResponse<null> = {
        error: '진행 중인 이벤트만 라운드를 생성할 수 있습니다.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const participants = event.participants.map((p) => ({
      id: p.playerId,
      name: p.player.name,
      gender: p.player.gender as 'MALE' | 'FEMALE',
      level: p.player.level as 'A' | 'B' | 'C' | 'D',
    }));

    const roundNumber = event.matches.length + 1;
    const gamesPlayedMap = getGamesPlayedMap(event.participants);
    const matchHistory = getMatchHistory(event.matches);

    const result = generateRound({
      participants,
      roundNumber,
      courtsAvailable: courtNumber,
      gamesPlayedMap,
      matchHistory,
    });

    if (result.matches.length === 0) {
      const response: ApiResponse<null> = {
        message: '더 이상 매치를 생성할 수 없습니다.',
      };
      return NextResponse.json(response, { status: 200 });
    }

    const createdMatches = await Promise.all(
      result.matches.map(async (match, index) => {
        const matchData = await prisma.match.create({
          data: {
            eventId,
            roundNumber,
            courtNumber: index + 1,
            matchType: match.matchType,
            status: 'SCHEDULED',
            team1Score: null,
            team2Score: null,
            players: {
              create: [
                ...match.team1.map((p) => ({
                  playerId: p.id,
                  team: 1,
                })),
                ...match.team2.map((p) => ({
                  playerId: p.id,
                  team: 2,
                })),
              ],
            },
          },
          include: {
            players: {
              include: {
                player: true,
              },
            },
          },
        });

        return matchData;
      })
    );

    const nextRound = event.matches.length + 1;
    const nextTotalRounds = nextRound + Math.ceil(result.matches.length / courtNumber);

    await prisma.event.update({
      where: { id: eventId },
      data: {
        totalRounds: nextTotalRounds,
        status: 'ACTIVE',
      },
    });

    const response: ApiResponse<typeof createdMatches> = {
      data: createdMatches,
      message: `${result.matches.length}개의 매치가 생성되었습니다.`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error generating round:', error);
    const response: ApiResponse<null> = {
      error: '라운드 생성에 실패했습니다.',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
