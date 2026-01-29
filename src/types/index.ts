// Re-export Prisma types for convenience
export type { Player, Event, Match, MatchPlayer, EventParticipant } from '@prisma/client';

// Enum types
export type Gender = 'MALE' | 'FEMALE';
export type Level = 'A' | 'B' | 'C' | 'D';
export type EventStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';
export type MatchType = 'SINGLES' | 'DOUBLES';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Player with relations
export interface PlayerWithStats {
  id: string;
  name: string;
  gender: Gender;
  level: Level;
  isActive: boolean;
  totalGames: number;
  wins: number;
  losses: number;
}

// Event with participants and matches
export interface EventWithDetails {
  id: string;
  name: string;
  date: Date;
  status: EventStatus;
  totalRounds: number;
  participants: ParticipantInfo[];
  matches: MatchWithPlayers[];
}

// Participant info
export interface ParticipantInfo {
  id: string;
  playerId: string;
  playerName: string;
  gender: Gender;
  level: Level;
  gamesPlayed: number;
}

// Match with player details
export interface MatchWithPlayers {
  id: string;
  roundNumber: number;
  courtNumber: number;
  matchType: MatchType;
  status: MatchStatus;
  team1Score: number | null;
  team2Score: number | null;
  team1: PlayerInfo[];
  team2: PlayerInfo[];
}

// Player info for match display
export interface PlayerInfo {
  id: string;
  name: string;
  gender: Gender;
  level: Level;
}
