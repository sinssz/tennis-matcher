'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Play, Plus } from 'lucide-react';
import { RoundView } from '@/components/features/events/RoundView';
import { ParticipantSelector } from '@/components/features/events/ParticipantSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type EventWithDetails, type ApiResponse } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '준비 중',
  ACTIVE: '진행 중',
  COMPLETED: '종료',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  ACTIVE: 'default',
  COMPLETED: 'secondary',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showParticipantDialog, setShowParticipantDialog] = useState(false);
  const [courtsAvailable, setCourtsAvailable] = useState<string>('2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('이벤트를 불러올 수 없습니다');
        }
        const data = (await response.json()) as ApiResponse<EventWithDetails>;
        setEvent(data.data || null);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, refreshTrigger]);

  const handleStartEvent = async () => {
    if (!event) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ACTIVE',
        }),
      });

      if (!response.ok) {
        throw new Error('이벤트 시작에 실패했습니다');
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    }
  };

  const handleGenerateRound = async () => {
    if (!event) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/generate-round`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courtNumber: parseInt(courtsAvailable),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || '대진 생성에 실패했습니다');
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">이벤트를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const GENDER_SYMBOL: Record<string, string> = {
    MALE: '👨',
    FEMALE: '👩',
  };

  const LEVEL_LABELS: Record<string, string> = {
    A: 'A - 상',
    B: 'B - 중상',
    C: 'C - 중하',
    D: 'D - 하',
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const groupedMatches = event.matches.reduce(
    (acc, match) => {
      const round = match.roundNumber;
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    },
    {} as Record<number, typeof event.matches>
  );

  const rounds = Object.keys(groupedMatches)
    .map((r) => parseInt(r))
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <Button onClick={() => router.back()} variant="ghost" size="sm" className="-ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <p className="text-muted-foreground mt-2">{formatDate(event.date)}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[event.status]}>{STATUS_LABELS[event.status]}</Badge>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Participants Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>참가자 ({event.participants.length}명)</CardTitle>
            {event.status === 'DRAFT' && (
              <Button onClick={() => setShowParticipantDialog(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                추가
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {event.participants.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {event.status === 'DRAFT'
                ? '참가자를 추가하려면 "추가" 버튼을 클릭하세요'
                : '참가자가 없습니다'}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {event.participants.map((participant) => (
                <div key={participant.id} className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium text-sm">{participant.playerName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {GENDER_SYMBOL[participant.gender]} / {LEVEL_LABELS[participant.level]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    경기: {participant.gamesPlayed}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {event.status === 'DRAFT' && event.participants.length > 0 && (
        <Button onClick={handleStartEvent} className="w-full sm:w-auto">
          <Play className="h-4 w-4 mr-2" />
          이벤트 시작
        </Button>
      )}

      {event.status === 'ACTIVE' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">대진 생성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">사용 가능한 코트 수</label>
              <Select value={courtsAvailable} onValueChange={setCourtsAvailable}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}개 코트
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateRound} disabled={isGenerating} className="w-full">
              {isGenerating ? '생성 중...' : '대진 생성'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Matches Section */}
      {rounds.length > 0 && (
        <div className="space-y-8">
          {rounds.map((round) => (
            <RoundView
              key={round}
              roundNumber={round}
              matches={groupedMatches[round] || []}
              onScoreUpdate={() => setRefreshTrigger((prev) => prev + 1)}
            />
          ))}
        </div>
      )}

      {event.status === 'ACTIVE' && rounds.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-amber-900 text-sm">
              대진을 생성하려면 위의 &quot;대진 생성&quot; 섹션에서 코트 수를 선택하고 버튼을
              클릭하세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* Participant Selector Dialog */}
      <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>참가자 추가</DialogTitle>
            <DialogDescription>이벤트에 참가할 선수를 선택하세요</DialogDescription>
          </DialogHeader>
          <ParticipantSelector
            eventId={eventId}
            onSuccess={() => {
              setShowParticipantDialog(false);
              setRefreshTrigger((prev) => prev + 1);
            }}
            onCancel={() => setShowParticipantDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
