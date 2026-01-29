import { prisma } from '@/lib/db';
import { ApiResponse } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { team1Score, team2Score } = body;

    if (
      team1Score === undefined ||
      team2Score === undefined ||
      typeof team1Score !== 'number' ||
      typeof team2Score !== 'number'
    ) {
      const response: ApiResponse<null> = {
        error: '유효한 점수를 입력해주세요.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const matchId = params.id;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
      },
    });

    if (!match) {
      const response: ApiResponse<null> = {
        error: '매치를 찾을 수 없습니다.',
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (match.status === 'COMPLETED') {
      const response: ApiResponse<null> = {
        error: '이미 완료된 매치입니다.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const completedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        team1Score,
        team2Score,
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof completedMatch> = {
      data: completedMatch,
      message: '매치 결과가 업데이트되었습니다.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      const response: ApiResponse<null> = {
        error: error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Error updating match score:', error);
    const response: ApiResponse<null> = {
      error: '매치 결과 업데이트에 실패했습니다.',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
