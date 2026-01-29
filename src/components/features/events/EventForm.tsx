'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema } from '@/lib/validations';
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

interface EventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({ onSuccess, onCancel }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      date: new Date(),
    },
  });

  const onSubmit = async (values: unknown) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
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
              <FormLabel>이벤트명</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 이름을 입력하세요" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => {
            const dateValue =
              field.value instanceof Date ? field.value.toISOString().split('T')[0] : '';
            return (
              <FormItem>
                <FormLabel>날짜</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={isLoading}
                    value={dateValue}
                    onChange={(e) => {
                      field.onChange(new Date(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '생성 중...' : '생성'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
