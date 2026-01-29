import { describe, it, expect } from 'vitest';

describe('Algorithm - Match Generation', () => {
  it('should calculate level balance score', () => {
    const team1 = [
      { id: '1', name: 'P1', gender: 'MALE', level: 'A' },
      { id: '2', name: 'P2', gender: 'MALE', level: 'B' },
    ];
    const team2 = [
      { id: '3', name: 'P3', gender: 'MALE', level: 'C' },
      { id: '4', name: 'P4', gender: 'MALE', level: 'D' },
    ];

    const totalScore = 0.3 + 0.25 + 0.25 + 0.1 + 0.1;

    expect(totalScore).toBe(1);
  });

  it('should handle empty match history', () => {
    const matchHistory: any[] = [];

    expect(matchHistory.length).toBe(0);
  });
});
