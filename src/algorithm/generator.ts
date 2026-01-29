import type {
  GenerateRoundInput,
  GenerateRoundOutput,
  GeneratedMatch,
  AlgorithmPlayer,
} from './types';
import { calculateTotalScore, type ScoringWeights } from './scoring';

const DEFAULT_WEIGHTS: ScoringWeights = {
  levelBalance: 0.3,
  genderBalance: 0.25,
  gameCountFairness: 0.25,
  opponentDiversity: 0.1,
  partnerDiversity: 0.1,
};

export function generateRound(input: GenerateRoundInput): GenerateRoundOutput {
  const { participants, courtsAvailable, gamesPlayedMap, matchHistory } = input;

  if (participants.length === 0) {
    return { matches: [], restingPlayers: [] };
  }

  if (courtsAvailable <= 0) {
    throw new Error('Invalid court availability');
  }

  const matches: GeneratedMatch[] = [];
  let availablePlayers = [...participants];

  const weights: ScoringWeights = DEFAULT_WEIGHTS;
  const context = {
    gamesPlayedMap,
    matchHistory,
  };

  const maxRounds = Math.ceil(availablePlayers.length / 2);
  const roundsToGenerate = Math.min(maxRounds, courtsAvailable);

  for (let round = 0; round < roundsToGenerate && availablePlayers.length >= 2; round++) {
    const currentRoundMatches = findBestMatches(availablePlayers, weights, context);

    if (currentRoundMatches.length === 0) {
      break;
    }

    currentRoundMatches.forEach((match) => {
      availablePlayers = availablePlayers.filter(
        (p) => !match.team1.includes(p) && !match.team2.includes(p)
      );
      matches.push(match);
    });
  }

  const restingPlayers = availablePlayers;

  return {
    matches,
    restingPlayers,
  };
}

function findBestMatches(
  availablePlayers: AlgorithmPlayer[],
  weights: ScoringWeights,
  context: { gamesPlayedMap: Map<string, number>; matchHistory: any[] }
): GeneratedMatch[] {
  const possibleMatches: GeneratedMatch[] = [];
  const n = availablePlayers.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const team1 = [availablePlayers[i], availablePlayers[j]];

      for (let k = j + 1; k < n; k++) {
        for (let l = k + 1; l < n; l++) {
          const team2 = [availablePlayers[k], availablePlayers[l]];

          const score = calculateTotalScore(team1, team2, weights, context);
          possibleMatches.push({
            team1,
            team2,
            score,
            matchType: 'DOUBLES' as const,
          });
        }
      }

      if (n % 2 === 1) {
        const team2 = [availablePlayers[k]];
        const score = calculateTotalScore(team1, team2, weights, context);
        possibleMatches.push({
          team1,
          team2,
          score,
          matchType: 'SINGLES' as const,
        });
      }
    }
  }

  possibleMatches.sort((a, b) => b.score - a.score);

  return possibleMatches.slice(0, 2);
}

export function findNextRoundMatches(
  currentMatches: GeneratedMatch[],
  availablePlayers: AlgorithmPlayer[],
  weights: ScoringWeights,
  context: { gamesPlayedMap: Map<string, number>; matchHistory: any[] }
): GeneratedMatch[] {
  const usedPlayerIds = new Set<string>();

  currentMatches.forEach((match) => {
    match.team1.forEach((p) => usedPlayerIds.add(p.id));
    match.team2.forEach((p) => usedPlayerIds.add(p.id));
  });

  const nextAvailablePlayers = availablePlayers.filter((p) => !usedPlayerIds.has(p.id));

  if (nextAvailablePlayers.length === 0) {
    return [];
  }

  return findBestMatches(nextAvailablePlayers, weights, context);
}

export function findRestingPlayers(
  availablePlayers: AlgorithmPlayer[],
  playedPlayers: AlgorithmPlayer[],
  maxRestingPerRound: number
): AlgorithmPlayer[] {
  const restScoreMap = new Map<string, number>();

  availablePlayers.forEach((player) => {
    const gamesPlayed = restScoreMap.get(player.id) || 0;
    restScoreMap.set(player.id, gamesPlayed + 1);
  });

  playedPlayers.forEach((player) => {
    const gamesPlayed = restScoreMap.get(player.id) || 0;
    restScoreMap.set(player.id, gamesPlayed);
  });

  const resting = Array.from(restScoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxRestingPerRound)
    .map(([playerId]) => availablePlayers.find((p) => p.id === playerId))
    .filter((p): p is AlgorithmPlayer => p !== undefined);

  return resting;
}
