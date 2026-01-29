# Tennis Matcher 🎾

테니스 동호회를 위한 스마트 대진표 생성 웹 애플리케이션

## 주요 기능

- ✨ **자동 대진 생성**: 실력, 성별, 게임 수를 고려한 공정한 대진표 자동 생성
- 👥 **참가자 관리**: 회원 등록 및 수준/성별 관리
- 📅 **이벤트 관리**: 모임 생성 및 참가자 선택
- 📊 **통계 분석**: 개인별 경기 통계 및 승률 분석
- 📱 **반응형 디자인**: 모바일/태블릿/데스크톱 모든 기기 지원

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form + Zod
- **State Management**: React hooks

### Backend
- **Runtime**: Node.js 20 LTS
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Validation**: Zod

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Vitest (unit), Playwright (E2E)

## 시작하기

### 필수 요구사항

- Node.js 20 이상
- pnpm 8 이상
- PostgreSQL 14 이상

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd tennis-matcher

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL 설정
```

### 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
pnpm db:generate

# 데이터베이스 스키마 적용
pnpm db:push

# 시드 데이터 추가 (선택)
pnpm db:seed
```

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 사용 가능한 스크립트

```bash
# 개발 서버 시작
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 코드 포맷팅
pnpm format

# 포맷 검사
pnpm format:check

# 단위 테스트 실행
pnpm test

# E2E 테스트 실행
pnpm test:e2e

# Prisma 스키마 생성
pnpm db:generate

# 데이터베이스 스키마 적용
pnpm db:push

# 데이터베이스 마이그레이션
pnpm db:migrate

# Prisma Studio 실행
pnpm db:studio

# 시드 데이터 추가
pnpm db:seed
```

## 프로젝트 구조

```
tennis-matcher/
├── prisma/
│   ├── schema.prisma       # 데이터베이스 스키마
│   └── seed.ts             # 시드 데이터
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── players/       # 참가자 페이지
│   │   ├── events/        # 이벤트 페이지
│   │   └── stats/         # 통계 페이지
│   ├── algorithm/         # 대진 생성 알고리즘
│   │   ├── scoring.ts     # 스코어링 함수
│   │   ├── generator.ts   # 매치 생성기
│   │   └── utils.ts       # 유틸리티
│   ├── components/
│   │   ├── ui/            # shadcn/ui 컴포넌트
│   │   ├── common/        # 공통 컴포넌트
│   │   └── features/      # 기능별 컴포넌트
│   ├── lib/
│   │   ├── db.ts          # Prisma 클라이언트
│   │   ├── validations.ts # Zod 스키마
│   │   └── utils.ts       # 유틸리티
│   └── types/
│       └── index.ts       # TypeScript 타입
└── tests/                 # 테스트 파일
```

## 대진 생성 알고리즘

### 가중치 기반 스코어링

대진표는 다음 5가지 요소를 가중치로 계산하여 생성됩니다:

- **실력 균형** (30%): 비슷한 수준의 선수끼리 매칭
- **성별 균형** (25%): 동성 복식 우선
- **게임 수 공평** (25%): 모든 참가자가 비슷한 게임 수
- **상대 다양성** (10%): 같은 상대와 재매칭 최소화
- **파트너 다양성** (10%): 다양한 파트너와 플레이

### 알고리즘 복잡도

- 시간 복잡도: O(C(n,4) × 3)
- 10-20명 규모에서 밀리초 단위 실행

## API 엔드포인트

### Players API
- `GET /api/players` - 참가자 목록
- `POST /api/players` - 참가자 생성
- `GET /api/players/:id` - 참가자 조회
- `PUT /api/players/:id` - 참가자 수정
- `DELETE /api/players/:id` - 참가자 삭제

### Events API
- `GET /api/events` - 이벤트 목록
- `POST /api/events` - 이벤트 생성
- `GET /api/events/:id` - 이벤트 상세
- `PUT /api/events/:id` - 이벤트 수정
- `DELETE /api/events/:id` - 이벤트 삭제
- `POST /api/events/:id/participants` - 참가자 추가
- `POST /api/events/:id/generate-round` - 라운드 생성

### Matches API
- `PUT /api/matches/:id/score` - 경기 결과 입력

### Statistics API
- `GET /api/stats/players` - 플레이어 통계

## 배포

### Vercel 배포

1. Vercel 계정 생성 및 프로젝트 연결
2. 환경 변수 설정 (DATABASE_URL)
3. 자동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 환경 변수

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## 라이선스

MIT

## 기여

기여를 환영합니다! Issue나 Pull Request를 자유롭게 제출해주세요.

## 지원

문제가 발생하면 [Issues](https://github.com/yourusername/tennis-matcher/issues)에 등록해주세요.
