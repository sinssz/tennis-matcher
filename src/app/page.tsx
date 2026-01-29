import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Tennis Matcher</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          테니스 동호회를 위한 스마트 대진표 생성 서비스
        </p>
        <p className="text-muted-foreground">
          실력, 성별, 게임 수를 고려한 공정한 대진표를 자동으로 생성합니다
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 max-w-4xl w-full">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>참가자 관리</CardTitle>
            <CardDescription>회원 등록 및 수준/성별 설정</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link href="/players">참가자 관리</Link>
            </Button>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>이벤트 관리</CardTitle>
            <CardDescription>모임 생성 및 대진표 생성</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link href="/events">이벤트 관리</Link>
            </Button>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>통계</CardTitle>
            <CardDescription>개인/전체 경기 통계 조회</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/stats">통계 보기</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
