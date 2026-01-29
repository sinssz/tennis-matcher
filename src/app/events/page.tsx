'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventList } from '@/components/features/events/EventList';
import { EventForm } from '@/components/features/events/EventForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EventsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">이벤트 관리</h1>
          <p className="text-muted-foreground mt-2">테니스 모임을 생성하고 대진표를 관리합니다</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="sm:self-start">
          <Plus className="mr-2 h-4 w-4" /> 새 이벤트
        </Button>
      </div>

      <EventList
        refreshTrigger={refreshTrigger}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 이벤트 생성</DialogTitle>
            <DialogDescription>새로운 테니스 모임 이벤트를 생성합니다</DialogDescription>
          </DialogHeader>
          <EventForm onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
