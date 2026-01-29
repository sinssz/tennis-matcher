import { prisma } from '@/lib/db';
import { createEventSchema } from '@/lib/validations';
import { ApiResponse } from '@/types';
import { Event } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * GET /api/events
 * Fetch all events sorted by date
 */
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });

    const response: ApiResponse<Event[]> = {
      data: events,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to fetch events',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/events
 * Create a new event
 * Body: { name: string, date: string (ISO 8601) }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Zod schema
    const validatedData = createEventSchema.parse(body);

    // Create event in database
    const event = await prisma.event.create({
      data: validatedData,
    });

    const response: ApiResponse<Event> = {
      data: event,
      message: '이벤트가 성공적으로 생성되었습니다',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const response: ApiResponse<null> = {
        error: error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Error creating event:', error);
    const response: ApiResponse<null> = {
      error: 'Failed to create event',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
