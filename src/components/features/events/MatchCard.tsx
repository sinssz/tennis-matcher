'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type MatchWithPlayers, type MatchStatus } from '@/types';
import { ScoreInput } from './ScoreInput';

interface MatchCardProps {
  match: MatchWithPlayers;
  onScoreUpdate: () => void;
}

const MATCH_TYPE_LABELS: Record<string, string> = {
  SINGLES: '단식',
  DOUBLES: '복식',
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: '예정',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
};

const STATUS_VARIANTS: Record<MatchStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  SCHEDULED: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
};

export function MatchCard({ match, onScoreUpdate }: MatchCardProps) {
  const [showScoreDialog, setShowScoreDialog] = useState(false);

  const handleScoreSuccess = () => {
    setShowScoreDialog(false);
    onScoreUpdate();
  };

  const LEVEL_COLORS: Record<string, string> = {
    A: 'text-red-600 bg-red-50',
    B: 'text-blue-600 bg-blue-50',
    C: 'text-amber-600 bg-amber-50',
    D: 'text-gray-600 bg-gray-50',
  };

  const GENDER_SYMBOL: Record<string, string> = {
    MALE: '👨',
    FEMALE: '👩',
  };

  const isCompleted = match.status === 'COMPLETED';
  const team1Won =
    isCompleted &&
    match.team1Score !== null &&
    match.team2Score !== null &&
    match.team1Score > match.team2Score;
  const team2Won =
    isCompleted &&
    match.team1Score !== null &&
    match.team2Score !== null &&
    match.team2Score > match.team1Score;

  return (
    <>
      <Card className={`overflow-hidden ${isCompleted ? 'bg-muted/50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base">코트 {match.courtNumber}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {MATCH_TYPE_LABELS[match.matchType]} • 라운드 {match.roundNumber}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[match.status]}>{STATUS_LABELS[match.status]}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Team 1 */}
          <div
            className={`p-3 border rounded-lg ${team1Won ? 'bg-green-50 border-green-200' : ''}`}
          >
            <div className="space-y-2">
              {match.team1.map((player) => (
                <div key={player.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <span>{GENDER_SYMBOL[player.gender]}</span>
                    <span className="font-medium">{player.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${LEVEL_COLORS[player.level]}`}>
                      {player.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score */}
          {isCompleted ? (
            <div className="flex items-center justify-center py-2">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  <span className={team1Won ? 'text-green-600' : ''}>{match.team1Score}</span>
                  {' : '}
                  <span className={team2Won ? 'text-green-600' : ''}>{match.team2Score}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-muted-foreground text-sm py-2">
              점수 미입력
            </div>
          )}

          {/* Team 2 */}
          <div
            className={`p-3 border rounded-lg ${team2Won ? 'bg-green-50 border-green-200' : ''}`}
          >
            <div className="space-y-2">
              {match.team2.map((player) => (
                <div key={player.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <span>{GENDER_SYMBOL[player.gender]}</span>
                    <span className="font-medium">{player.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${LEVEL_COLORS[player.level]}`}>
                      {player.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Input Button */}
          {!isCompleted && (
            <Button
              onClick={() => setShowScoreDialog(true)}
              variant="default"
              size="sm"
              className="w-full"
            >
              점수 입력
            </Button>
          )}

          {isCompleted && (
            <Button
              onClick={() => setShowScoreDialog(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              점수 수정
            </Button>
          )}
        </CardContent>
      </Card>

      <ScoreInput
        matchId={match.id}
        currentTeam1Score={match.team1Score}
        currentTeam2Score={match.team2Score}
        open={showScoreDialog}
        onOpenChange={setShowScoreDialog}
        onSuccess={handleScoreSuccess}
      />
    </>
  );
}
