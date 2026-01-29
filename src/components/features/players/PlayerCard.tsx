'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { type Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  onEdit: (playerId: string) => void;
  onDelete: (playerId: string) => void;
  isDeleting: boolean;
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

const LEVEL_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
  D: 'destructive',
};

export function PlayerCard({ player, onEdit, onDelete, isDeleting }: PlayerCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg break-words">{player.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {GENDER_LABELS[player.gender] || player.gender}
            </p>
          </div>
          {player.isActive ? (
            <Badge variant="default" className="shrink-0">
              활성
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              비활성
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">수준</p>
          <Badge variant={LEVEL_VARIANTS[player.level]}>
            {LEVEL_LABELS[player.level] || player.level}
          </Badge>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(player.id)}>
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(player.id)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
