import type { Gender, Level } from '@/types';

// Player info for algorithm
export interface AlgorithmPlayer {
  id: string;
  name: string;
  gender: Gender;
  level: Level;
}

// Match history entry
export interface MatchHistory {
  player1Id: string;
  player2Id: string;
  asOpponents: boolean; // true: played against each other, false: played as partners
}

// Context for scoring
export interface MatchContext {
  gamesPlayedMap: Map<string, number>;
  matchHistory: MatchHistory[];
}

// Generated match result
export interface GeneratedMatch {
  team1: AlgorithmPlayer[];
  team2: AlgorithmPlayer[];
  score: number;
  matchType: 'SINGLES' | 'DOUBLES';
}

// Round generation input
export interface GenerateRoundInput {
  participants: AlgorithmPlayer[];
  roundNumber: number;
  courtsAvailable: number;
  gamesPlayedMap: Map<string, number>;
  matchHistory: MatchHistory[];
}

// Round generation output
export interface GenerateRoundOutput {
  matches: GeneratedMatch[];
  restingPlayers: AlgorithmPlayer[];
}

// Scoring weights
export interface ScoringWeights {
  levelBalance: number;
  genderBalance: number;
  gameCountFairness: number;
  opponentDiversity: number;
  partnerDiversity: number;
}

// Default weights as per design document
export const DEFAULT_WEIGHTS: ScoringWeights = {
  levelBalance: 0.3,
  genderBalance: 0.25,
  gameCountFairness: 0.25,
  opponentDiversity: 0.1,
  partnerDiversity: 0.1,
};
