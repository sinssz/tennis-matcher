import type { AlgorithmPlayer, MatchHistory, MatchContext } from './types';

export type ScoringWeights = {
  levelBalance: number;
  genderBalance: number;
  gameCountFairness: number;
  opponentDiversity: number;
  partnerDiversity: number;
};

export function calculateLevelBalanceScore(
  team1: AlgorithmPlayer[],
  team2: AlgorithmPlayer[],
  weights: ScoringWeights
): number {
  if (team1.length !== team2.length) return 0;

  const avgLevelTeam1 = calculateAverageLevel(team1);
  const avgLevelTeam2 = calculateAverageLevel(team2);

  const levelDiff = Math.abs(avgLevelTeam1 - avgLevelTeam2);
  const maxPossibleDiff = 3;

  const normalizedDiff = levelDiff / maxPossibleDiff;

  return (1 - normalizedDiff) * weights.levelBalance;
}

export function calculateGenderBalanceScore(
  team1: AlgorithmPlayer[],
  team2: AlgorithmPlayer[],
  weights: ScoringWeights
): number {
  if (team1.length !== team2.length) return 0;

  const maleCountTeam1 = team1.filter((p) => p.gender === 'MALE').length;
  const maleCountTeam2 = team2.filter((p) => p.gender === 'MALE').length;

  const maleDiff = Math.abs(maleCountTeam1 - maleCountTeam2);
  const maxPossibleDiff = Math.max(team1.length, team2.length);

  const normalizedDiff = maleDiff / maxPossibleDiff;

  return (1 - normalizedDiff) * weights.genderBalance;
}

export function calculateGameCountFairnessScore(
  team1: AlgorithmPlayer[],
  team2: AlgorithmPlayer[],
  weights: ScoringWeights,
  gamesPlayedMap: Map<string, number>
): number {
  const avgGamesTeam1 = calculateAverageGames(team1, gamesPlayedMap);
  const avgGamesTeam2 = calculateAverageGames(team2, gamesPlayedMap);

  const gamesDiff = Math.abs(avgGamesTeam1 - avgGamesTeam2);
  const maxPossibleDiff = Math.max(team1.length, team2.length);

  const normalizedDiff = gamesDiff / maxPossibleDiff;

  return (1 - normalizedDiff) * weights.gameCountFairness;
}

export function calculateOpponentDiversityScore(
  team1: AlgorithmPlayer[],
  team2: AlgorithmPlayer[],
  weights: ScoringWeights,
  matchHistory: MatchHistory[]
): number {
  const totalScore = weights.opponentDiversity;
  let diversityScore = 0;

  for (const player of team1) {
    const opponentCount = getOpponentCount(player.id, matchHistory);
    const expectedOpponents = Math.floor(team1.length / 2) + Math.floor(team2.length / 2);

    const diversityRatio = Math.min(opponentCount, expectedOpponents) / expectedOpponents;
    diversityScore += diversityRatio;
  }

  return (diversityScore / team1.length) * totalScore;
}

export function calculatePartnerDiversityScore(
  team1: AlgorithmPlayer[],
  team2: AlgorithmPlayer[],
  weights: ScoringWeights,
  matchHistory: MatchHistory[]
): number {
  const totalScore = weights.partnerDiversity;
  let partnerScore = 0;

  const allPlayers = [...team1, ...team2];

  for (const player of allPlayers) {
    const partners = getPartners(player.id, matchHistory);
    const expectedPartners = Math.floor(allPlayers.length / 2) - 1;

    const partnerRatio = Math.min(partners, expectedPartners) / expectedPartners;
    partnerScore += partnerRatio;
  }

  return (partnerScore / allPlayers.length) * totalScore;
}

function calculateAverageLevel(players: AlgorithmPlayer[]): number {
  const total = players.reduce((sum, p) => sum + getLevelValue(p.level), 0);
  return total / players.length;
}

function getLevelValue(level: string): number {
  switch (level) {
    case 'A':
      return 4;
    case 'B':
      return 3;
    case 'C':
      return 2;
    case 'D':
      return 1;
    default:
      return 2;
  }
}

function calculateAverageGames(
  players: AlgorithmPlayer[],
  gamesPlayedMap: Map<string, number>
): number {
  const total = players.reduce((sum, p) => sum + (gamesPlayedMap.get(p.id) || 0), 0);
  return total / players.length;
}

function getOpponentCount(playerId: string, matchHistory: MatchHistory[]): number {
  return matchHistory
    .filter((h) => h.player1Id === playerId || h.player2Id === playerId)
    .filter((h) => h.asOpponents).length;
}

function getPartners(playerId: string, matchHistory: MatchHistory[]): number {
  return matchHistory
    .filter((h) => h.player1Id === playerId || h.player2Id === playerId)
    .filter((h) => !h.asOpponents).length;
}

export function calculateTotalScore(
  team1: AlgorithmPlayer[],
  team2: AlgorithmPlayer[],
  weights: ScoringWeights,
  matchContext: MatchContext
): number {
  const levelScore = calculateLevelBalanceScore(team1, team2, weights);
  const genderScore = calculateGenderBalanceScore(team1, team2, weights);
  const gamesScore = calculateGameCountFairnessScore(
    team1,
    team2,
    weights,
    matchContext.gamesPlayedMap
  );
  const opponentScore = calculateOpponentDiversityScore(
    team1,
    team2,
    weights,
    matchContext.matchHistory
  );
  const partnerScore = calculatePartnerDiversityScore(
    team1,
    team2,
    weights,
    matchContext.matchHistory
  );

  return levelScore + genderScore + gamesScore + opponentScore + partnerScore;
}
