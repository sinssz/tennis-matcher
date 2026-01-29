'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type Player, type ApiResponse } from '@/types';

interface PlayerListProps {
  refreshTrigger: number;
  onEdit: (playerId: string) => void;
  onRefresh: () => void;
}

type FilterStatus = 'all' | 'active' | 'inactive';

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

export function PlayerList({ refreshTrigger, onEdit, onRefresh }: PlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

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
  }, [refreshTrigger]);

  const handleDelete = async (playerId: string) => {
    setDeletingId(playerId);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/players/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('참가자를 삭제할 수 없습니다');
      }

      setPlayers((prev) => prev.filter((p) => p.id !== deletingId));
      onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    } finally {
      setShowDeleteAlert(false);
      setDeletingId(null);
    }
  };

  const filteredPlayers = players.filter((player) => {
    if (filterStatus === 'active') return player.isActive;
    if (filterStatus === 'inactive') return !player.isActive;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
        {error}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">등록된 참가자가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as FilterStatus)}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모두</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground flex items-center">
          {filteredPlayers.length}명
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>성별</TableHead>
              <TableHead>수준</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{GENDER_LABELS[player.gender]}</TableCell>
                <TableCell>
                  <Badge variant={LEVEL_VARIANTS[player.level]}>{LEVEL_LABELS[player.level]}</Badge>
                </TableCell>
                <TableCell>
                  {player.isActive ? (
                    <Badge variant="default">활성</Badge>
                  ) : (
                    <Badge variant="outline">비활성</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(player.id)}
                      aria-label="수정"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(player.id)}
                      disabled={deletingId === player.id}
                      aria-label="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4 sm:grid-cols-2">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onEdit={onEdit}
            onDelete={handleDelete}
            isDeleting={deletingId === player.id}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {filterStatus === 'active'
              ? '활성 참가자가 없습니다'
              : filterStatus === 'inactive'
                ? '비활성 참가자가 없습니다'
                : '참가자가 없습니다'}
          </p>
        </div>
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>참가자 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 참가자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
