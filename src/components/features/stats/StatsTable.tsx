'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { type ApiResponse } from '@/types';

interface PlayerStats {
  id: string;
  name: string;
  gender: string;
  level: string;
  totalGames: number;
  wins: number;
  losses: number;
}

type SortBy = 'totalGames' | 'wins' | 'winRate' | 'name';

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

export function StatsTable() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('totalGames');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/stats/players');
        if (!response.ok) {
          throw new Error('통계를 불러올 수 없습니다');
        }
        const data = (await response.json()) as ApiResponse<PlayerStats[]>;
        setStats(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getSortedStats = () => {
    const sorted = [...stats];

    switch (sortBy) {
      case 'totalGames':
        return sorted.sort((a, b) => b.totalGames - a.totalGames);
      case 'wins':
        return sorted.sort((a, b) => b.wins - a.wins);
      case 'winRate':
        return sorted.sort((a, b) => {
          const rateA = a.totalGames > 0 ? a.wins / a.totalGames : 0;
          const rateB = b.totalGames > 0 ? b.wins / b.totalGames : 0;
          return rateB - rateA;
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      default:
        return sorted;
    }
  };

  const sortedStats = getSortedStats();

  const calculateWinRate = (wins: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((wins / total) * 100)}%`;
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

  if (stats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">통계 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:w-48">
          <label className="text-sm font-semibold mb-2 block">정렬 기준</label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalGames">경기수 (많은순)</SelectItem>
              <SelectItem value="wins">승수 (많은순)</SelectItem>
              <SelectItem value="winRate">승률 (높은순)</SelectItem>
              <SelectItem value="name">이름 (가나다순)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground flex items-center">총 {stats.length}명</div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>순위</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>성별</TableHead>
              <TableHead>수준</TableHead>
              <TableHead className="text-right">경기수</TableHead>
              <TableHead className="text-right">승</TableHead>
              <TableHead className="text-right">패</TableHead>
              <TableHead className="text-right">승률</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell>
                  <span className="font-semibold text-base">{index + 1}</span>
                </TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{GENDER_LABELS[player.gender]}</TableCell>
                <TableCell>{LEVEL_LABELS[player.level]}</TableCell>
                <TableCell className="text-right font-medium">{player.totalGames}</TableCell>
                <TableCell className="text-right text-green-600 font-semibold">
                  {player.wins}
                </TableCell>
                <TableCell className="text-right text-red-600 font-semibold">
                  {player.losses}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {calculateWinRate(player.wins, player.totalGames)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4 sm:grid-cols-2">
        {sortedStats.map((player, index) => (
          <Card key={player.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {GENDER_LABELS[player.gender]} / {LEVEL_LABELS[player.level]}
                  </p>
                </div>
                <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">경기수</p>
                  <p className="text-2xl font-bold">{player.totalGames}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-xs text-green-700 mb-1">승리</p>
                  <p className="text-2xl font-bold text-green-600">{player.wins}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-xs text-red-700 mb-1">패배</p>
                  <p className="text-2xl font-bold text-red-600">{player.losses}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-blue-700 mb-1">승률</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {calculateWinRate(player.wins, player.totalGames)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
