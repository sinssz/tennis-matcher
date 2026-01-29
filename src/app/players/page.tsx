'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PlayerList } from '@/components/features/players/PlayerList';
import { PlayerForm } from '@/components/features/players/PlayerForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PlayersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPlayerId(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditPlayer = (playerId: string) => {
    setEditingPlayerId(playerId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlayerId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">참가자 관리</h1>
          <p className="text-muted-foreground mt-2">테니스 동호회 회원을 등록하고 관리합니다</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="sm:self-start">
          <Plus className="mr-2 h-4 w-4" />새 참가자
        </Button>
      </div>

      <PlayerList
        refreshTrigger={refreshTrigger}
        onEdit={handleEditPlayer}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlayerId ? '참가자 수정' : '새 참가자 등록'}</DialogTitle>
            <DialogDescription>
              {editingPlayerId ? '참가자 정보를 수정합니다' : '새로운 참가자를 등록합니다'}
            </DialogDescription>
          </DialogHeader>
          <PlayerForm
            playerId={editingPlayerId}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
