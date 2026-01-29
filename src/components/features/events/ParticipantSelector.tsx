'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { type Player, type ApiResponse } from '@/types';

interface ParticipantSelectorProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParticipantSelector({ eventId, onSuccess, onCancel }: ParticipantSelectorProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/players');
        if (!response.ok) {
          throw new Error('참가자 목록을 불러올 수 없습니다');
        }
        const data = (await response.json()) as ApiResponse<Player[]>;
        setPlayers(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === players.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(players.map((p) => p.id)));
    }
  };

  const handleToggle = (playerId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedIds(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      setError('최소 1명의 참가자를 선택해주세요');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || '요청 처리에 실패했습니다');
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex gap-3 text-sm text-amber-800">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>등록된 참가자가 없습니다. 먼저 참가자를 등록해주세요.</div>
      </div>
    );
  }

  const GENDER_LABELS: Record<string, string> = {
    MALE: '남성',
    FEMALE: '여성',
  };

  const LEVEL_LABELS: Record<string, string> = {
    A: 'A - 상',
    B: 'B - 중상',
    C: 'C - 중하',
    D: 'D - 하',
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
        <Checkbox
          id="select-all"
          checked={selectedIds.size === players.length}
          onCheckedChange={handleSelectAll}
          disabled={isSubmitting}
        />
        <Label htmlFor="select-all" className="flex-1 cursor-pointer font-semibold text-sm">
          전체 선택 ({selectedIds.size}/{players.length})
        </Label>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50"
          >
            <Checkbox
              id={`player-${player.id}`}
              checked={selectedIds.has(player.id)}
              onCheckedChange={() => handleToggle(player.id)}
              disabled={isSubmitting}
            />
            <Label htmlFor={`player-${player.id}`} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {GENDER_LABELS[player.gender]} / {LEVEL_LABELS[player.level]}
                  </p>
                </div>
                {player.isActive && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    활성
                  </span>
                )}
              </div>
            </Label>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || selectedIds.size === 0}>
          {isSubmitting ? '추가 중...' : `추가 (${selectedIds.size}명)`}
        </Button>
      </div>
    </div>
  );
}
