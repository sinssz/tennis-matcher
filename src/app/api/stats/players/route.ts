import { prisma } from '@/lib/db';
import { ApiResponse } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    const participants = await prisma.eventParticipant.findMany({
      include: {
        event: true,
        player: true,
      },
    });

    const matchPlayers = await prisma.matchPlayer.findMany({
      include: {
        match: {
          include: {
            players: {
              include: {
                player: true,
              },
            },
          },
        },
        player: true,
      },
    });

    const playerStats = new Map<
      string,
      {
        id: string;
        name: string;
        gender: string;
        level: string;
        totalGames: number;
        wins: number;
        losses: number;
      }
    >();

    participants.forEach((participant) => {
      if (!playerStats.has(participant.playerId)) {
        playerStats.set(participant.playerId, {
          id: participant.playerId,
          name: participant.player.name,
          gender: participant.player.gender,
          level: participant.player.level,
          totalGames: 0,
          wins: 0,
          losses: 0,
        });
      }

      const stats = playerStats.get(participant.playerId)!;
      stats.totalGames += 1;
    });

    matchPlayers.forEach((matchPlayer) => {
      const match = matchPlayer.match;
      const players = match.players;

      if (players.length !== 2) return;

      const player1 = players[0].playerId;
      const player2 = players[1].playerId;

      let p1Won: boolean = false;
      let p2Won: boolean = false;

      if (match.team1Score !== null && match.team2Score !== null) {
        if (match.team1Score > match.team2Score) {
          if (players[0].team === 1 || players[1].team === 1) {
            p1Won = true;
          } else {
            p2Won = true;
          }
        } else if (match.team2Score > match.team1Score) {
          if (players[0].team === 2 || players[1].team === 2) {
            p1Won = true;
          } else {
            p2Won = true;
          }
        }
      }

      if (p1Won) {
        const stats = playerStats.get(player1);
        if (stats) {
          stats.wins += 1;
        }
      }

      if (p2Won) {
        const stats = playerStats.get(player2);
        if (stats) {
          stats.wins += 1;
        }
      }

      if (!p1Won && !p2Won) {
        if (playerStats.has(player1)) {
          playerStats.get(player1)!.losses += 1;
        }
        if (playerStats.has(player2)) {
          playerStats.get(player2)!.losses += 1;
        }
      }
    });

    const result = Array.from(playerStats.values());

    if (playerId) {
      const filtered = result.find((p) => p.id === playerId);
      if (!filtered) {
        const response: ApiResponse<null> = {
          error: '플레이어를 찾을 수 없습니다.',
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse<typeof filtered> = {
        data: filtered,
      };

      return NextResponse.json(response, { status: 200 });
    }

    const response: ApiResponse<typeof result> = {
      data: result,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching player statistics:', error);
    const response: ApiResponse<null> = {
      error: '플레이어 통계를 가져오는데 실패했습니다.',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
