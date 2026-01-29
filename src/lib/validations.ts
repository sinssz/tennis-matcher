import { z } from 'zod';

// Enum schemas
export const genderSchema = z.enum(['MALE', 'FEMALE']);
export const levelSchema = z.enum(['A', 'B', 'C', 'D']);
export const eventStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']);
export const matchTypeSchema = z.enum(['SINGLES', 'DOUBLES']);
export const matchStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']);

// Player schemas
export const createPlayerSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이하여야 합니다'),
  gender: genderSchema,
  level: levelSchema,
});

export const updatePlayerSchema = createPlayerSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Event schemas
export const createEventSchema = z.object({
  name: z.string().min(1, '이벤트 이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다'),
  date: z.coerce.date(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: eventStatusSchema.optional(),
});

// Participant schema
export const addParticipantsSchema = z.object({
  playerIds: z.array(z.string()).min(1, '최소 1명의 참가자를 선택해주세요'),
});

// Match score schema
export const updateScoreSchema = z.object({
  team1Score: z.number().min(0, '점수는 0 이상이어야 합니다'),
  team2Score: z.number().min(0, '점수는 0 이상이어야 합니다'),
});

// Generate round schema
export const generateRoundSchema = z.object({
  courtsAvailable: z.number().min(1, '최소 1개의 코트가 필요합니다').default(2),
});

// Type exports
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AddParticipantsInput = z.infer<typeof addParticipantsSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
export type GenerateRoundInput = z.infer<typeof generateRoundSchema>;
