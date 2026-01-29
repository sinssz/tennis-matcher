import { StatsTable } from '@/components/features/stats/StatsTable';

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">통계</h1>
        <p className="text-muted-foreground mt-2">선수별 경기 통계를 조회합니다</p>
      </div>

      <StatsTable />
    </div>
  );
}
