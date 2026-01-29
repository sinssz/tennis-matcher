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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type Event, type ApiResponse } from '@/types';

interface EventListProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

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

export function EventList({ refreshTrigger, onRefresh }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('이벤트 목록을 불러올 수 없습니다');
        }
        const data = (await response.json()) as ApiResponse<Event[]>;
        setEvents(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [refreshTrigger]);

  const handleDelete = (eventId: string) => {
    setDeletingId(eventId);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/events/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('이벤트를 삭제할 수 없습니다');
      }

      setEvents((prev) => prev.filter((e) => e.id !== deletingId));
      onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    } finally {
      setShowDeleteAlert(false);
      setDeletingId(null);
    }
  };

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

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">등록된 이벤트가 없습니다</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이벤트명</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>라운드</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{formatDate(event.date)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[event.status]}>
                    {STATUS_LABELS[event.status]}
                  </Badge>
                </TableCell>
                <TableCell>{event.totalRounds}라운드</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button asChild variant="ghost" size="sm" aria-label="상세보기">
                      <Link href={`/events/${event.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
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
        {events.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{event.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">날짜:</span>
                  <p className="font-medium">{formatDate(event.date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">상태:</span>
                  <p>
                    <Badge variant={STATUS_VARIANTS[event.status]}>
                      {STATUS_LABELS[event.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">라운드:</span>
                  <p className="font-medium">{event.totalRounds}라운드</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link href={`/events/${event.id}`}>상세보기</Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이벤트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 이벤트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
