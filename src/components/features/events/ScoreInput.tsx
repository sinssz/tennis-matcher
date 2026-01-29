'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ScoreInputProps {
  matchId: string;
  currentTeam1Score: number | null;
  currentTeam2Score: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ScoreInput({
  matchId,
  currentTeam1Score,
  currentTeam2Score,
  open,
  onOpenChange,
  onSuccess,
}: ScoreInputProps) {
  const [team1Score, setTeam1Score] = useState<string>('');
  const [team2Score, setTeam2Score] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTeam1Score(currentTeam1Score !== null ? currentTeam1Score.toString() : '');
      setTeam2Score(currentTeam2Score !== null ? currentTeam2Score.toString() : '');
      setError(null);
    }
  }, [open, currentTeam1Score, currentTeam2Score]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const t1 = parseInt(team1Score);
    const t2 = parseInt(team2Score);

    if (isNaN(t1) || isNaN(t2)) {
      setError('유효한 점수를 입력해주세요');
      return;
    }

    if (t1 < 0 || t2 < 0) {
      setError('점수는 0 이상이어야 합니다');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1Score: t1,
          team2Score: t2,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || '요청 처리에 실패했습니다');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>점수 입력</DialogTitle>
          <DialogDescription>각 팀의 점수를 입력하세요</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">팀 1 점수</label>
              <Input
                type="number"
                min="0"
                value={team1Score}
                onChange={(e) => setTeam1Score(e.target.value)}
                placeholder="0"
                disabled={isLoading}
                className="text-center text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">팀 2 점수</label>
              <Input
                type="number"
                min="0"
                value={team2Score}
                onChange={(e) => setTeam2Score(e.target.value)}
                placeholder="0"
                disabled={isLoading}
                className="text-center text-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
