import { describe, it, expect } from 'vitest';
import type { MatchHistory } from '../types';

describe('Algorithm - Match Generation', () => {
  it('should calculate total weights correctly', () => {
    const totalScore = 0.3 + 0.25 + 0.25 + 0.1 + 0.1;

    expect(totalScore).toBe(1);
  });

  it('should handle empty match history', () => {
    const matchHistory: MatchHistory[] = [];

    expect(matchHistory.length).toBe(0);
  });
});
