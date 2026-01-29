'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlayerSchema, type CreatePlayerInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Player } from '@/types';

interface PlayerFormProps {
  playerId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PlayerForm({ playerId, onSuccess, onCancel }: PlayerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!playerId);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      name: '',
      gender: 'MALE',
      level: 'B',
    },
  });

  useEffect(() => {
    if (!playerId) {
      setIsFetching(false);
      return;
    }

    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${playerId}`);
        if (!response.ok) {
          throw new Error('참가자 정보를 불러올 수 없습니다');
        }
        const data = (await response.json()) as { data: Player };
        form.reset({
          name: data.data.name,
          gender: data.data.gender,
          level: data.data.level,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchPlayer();
  }, [playerId, form]);

  const onSubmit = async (values: CreatePlayerInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = playerId ? `/api/players/${playerId}` : '/api/players';
      const method = playerId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
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
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="py-8 text-center text-muted-foreground">로딩 중...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="참가자 이름을 입력하세요" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>성별</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="MALE"
                      checked={field.value === 'MALE'}
                      onChange={() => field.onChange('MALE')}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">남성</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="FEMALE"
                      checked={field.value === 'FEMALE'}
                      onChange={() => field.onChange('FEMALE')}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">여성</span>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>수준</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="수준을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">A - 상</SelectItem>
                  <SelectItem value="B">B - 중상</SelectItem>
                  <SelectItem value="C">C - 중하</SelectItem>
                  <SelectItem value="D">D - 하</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '저장 중...' : playerId ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
