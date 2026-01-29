'use client';

import { MatchCard } from './MatchCard';
import { type MatchWithPlayers } from '@/types';

interface RoundViewProps {
  roundNumber: number;
  matches: MatchWithPlayers[];
  onScoreUpdate: () => void;
}

export function RoundView({ roundNumber, matches, onScoreUpdate }: RoundViewProps) {
  if (matches.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">라운드 {roundNumber}의 매치가 없습니다</p>
      </div>
    );
  }

  const completedCount = matches.filter((m) => m.status === 'COMPLETED').length;
  const completionRate = Math.round((completedCount / matches.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">라운드 {roundNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{matches.length} 매치 완료 ({completionRate}%)
          </p>
        </div>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} onScoreUpdate={onScoreUpdate} />
        ))}
      </div>
    </div>
  );
}
