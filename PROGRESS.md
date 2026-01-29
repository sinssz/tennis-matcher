# Tennis Matcher - 작업 진행 상황

## 개요

테니스 동호회 대진 생성 웹 애플리케이션 개발 진행 상황을 기록합니다.

---

## Phase 1: 프로젝트 초기 설정 ✅ 완료

### 완료된 작업

- [x] 1.1 Next.js 프로젝트 생성
- [x] 1.2 TypeScript, ESLint, Prettier 설정
- [x] 1.3 Tailwind CSS, shadcn/ui 설정
- [x] 1.4 Prisma 초기 설정
- [x] 1.5 프로젝트 구조 생성

### 커밋 이력

| 커밋    | 설명                                                     | 날짜       |
| ------- | -------------------------------------------------------- | ---------- |
| 5f8d35e | chore: initialize project with git and progress tracking | 2026-01-29 |
| adbc7ce | feat: setup Next.js 14 with TypeScript and Tailwind CSS  | 2026-01-29 |
| 8b84b20 | chore: configure ESLint and Prettier integration         | 2026-01-29 |
| 4dbebf9 | feat: setup shadcn/ui component library                  | 2026-01-29 |
| 84758f3 | feat: setup Prisma ORM with database schema              | 2026-01-29 |
| 85a84cb | feat: create project structure and base components       | 2026-01-29 |

### 설치된 의존성

- **프레임워크**: Next.js 14 (App Router), TypeScript
- **UI**: shadcn/ui, Tailwind CSS, lucide-react
- **폼/검증**: React Hook Form, Zod
- **ORM**: Prisma 5 (PostgreSQL)
- **코드 품질**: ESLint, Prettier
- **테스트**: Vitest

### 생성된 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (완료)
│   │   ├── players/       # Player CRUD API
│   │   ├── events/        # Event CRUD API
│   │   ├── matches/       # Match score update API
│   │   └── stats/         # Statistics API
│   ├── players/           # 참가자 페이지 (준비)
│   ├── events/            # 이벤트 페이지 (준비)
│   └── stats/             # 통계 페이지 (준비)
├── algorithm/             # 대진 생성 알고리즘 (완료)
│   ├── types.ts           # 알고리즘 타입 정의
│   ├── scoring.ts         # 5개 점수 계산 함수
│   ├── generator.ts       # 라운드/매치 생성 로직
│   ├── utils.ts           # 유틸리티 함수
│   └── __tests__/         # 단위 테스트
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── common/            # Header 등 공통 컴포넌트
│   └── features/          # 기능별 컴포넌트 (준비)
├── hooks/                 # 커스텀 훅 (준비)
├── lib/
│   ├── db.ts              # Prisma 클라이언트
│   ├── utils.ts           # 유틸리티 함수
│   └── validations.ts     # Zod 스키마
└── types/
    └── index.ts           # TypeScript 타입 정의
```

---

## Phase 2: 데이터베이스 및 API ✅ 완료

### 완료된 작업

- [x] 2.1 데이터베이스 연결 설정 (.env 파일)
- [x] 2.2 Players CRUD API 구현 (5개 엔드포인트)
- [x] 2.3 Events CRUD API 구현 (6개 엔드포인트)
- [x] 2.4 시드 데이터 작성 (12 플레이어, 1 이벤트)

### 커밋 이력

| 커밋    | 설명                                          | 날짜       |
| ------- | --------------------------------------------- | ---------- |
| f88c67f | feat: implement Players CRUD API              | 2026-01-29 |
| e9b6099 | feat: implement Events CRUD API and seed data | 2026-01-29 |

### API 엔드포인트

**Players API** (src/app/api/players/)

- `GET /api/players` - 참가자 목록 (isActive 필터)
- `POST /api/players` - 참가자 생성
- `GET /api/players/[id]` - 참가자 조회
- `PUT /api/players/[id]` - 참가자 수정
- `DELETE /api/players/[id]` - 참가자 삭제

**Events API** (src/app/api/events/)

- `GET /api/events` - 이벤트 목록
- `POST /api/events` - 이벤트 생성
- `GET /api/events/[id]` - 이벤트 상세 (참가자, 매치 포함)
- `PUT /api/events/[id]` - 이벤트 수정
- `DELETE /api/events/[id]` - 이벤트 삭제
- `POST /api/events/[id]/participants` - 참가자 추가

### 시드 데이터

- 12명 샘플 플레이어 (남성 6, 여성 6, A/B/C/D 등급 분포)
- 1개 샘플 이벤트 (10명 참가자)
- 실행: `pnpm db:seed`

---

## Phase 3: 대진 생성 알고리즘 ✅ 완료

### 완료된 작업

- [x] 3.1 가중치 기반 점수 계산 함수 구현
- [x] 3.2 라운드/매치 생성 알고리즘 구현
- [x] 3.3 무작위 대진 생성 (가중치 그리디 알고리즘)
- [x] 3.4 generate-round API endpoint 구현
- [x] 3.5 매치 점수 업데이트 API endpoint 구현
- [x] 3.6 플레이어 통계 API endpoint 구현
- [x] 3.7 알고리즘 단위 테스트 추가

### 커밋 이력

| 커밋    | 설명                                                            | 날짜       |
| ------- | --------------------------------------------------------------- | ---------- |
| 2b65f3c | feat: implement weighted scoring functions for match generation | 2026-01-29 |
| 10f469f | feat: implement round and match generation algorithm            | 2026-01-29 |
| e82e424 | feat: add generate-round API endpoint                           | 2026-01-29 |
| db24b7a | feat: add match score update API endpoint                       | 2026-01-29 |
| 8442c77 | feat: add player statistics API endpoint                        | 2026-01-29 |
| cd9061c | feat: add vitest configuration and unit tests                   | 2026-01-29 |

### 알고리즘 구조

**Scoring Functions** (scoring.ts)

- `calculateLevelBalanceScore()` - 실력 수준 균형 점수 (30%)
- `calculateGenderBalanceScore()` - 성별 균형 점수 (25%)
- `calculateGameCountFairnessScore()` - 게임 수 공정성 점수 (25%)
- `calculateOpponentDiversityScore()` - 상대 다양성 점수 (10%)
- `calculatePartnerDiversityScore()` - 파트너 다양성 점수 (10%)
- `calculateTotalScore()` - 전체 점수 합산

**Generation Functions** (generator.ts)

- `generateRound()` - 라운드 매치 생성
- `findBestMatches()` - 최적 팀 조합 찾기
- `findNextRoundMatches()` - 다음 라운드 매치 생성
- `findRestingPlayers()` - 휴식 플레이어 식별

**Utility Functions** (utils.ts)

- `getGamesPlayedMap()` - 게임 플레이 횟수 추적
- `getMatchHistory()` - 매치 이력 생성

### API 엔드포인트

**Generate Round** (src/app/api/events/[id]/generate-round/route.ts)

- `POST /api/events/:id/generate-round` - 다음 라운드 매치 생성
  - 파라미터: `courtNumber` (코트 개수)
  - 응답: 생성된 매치 목록
  - 알고리즘: 가중치 기반 그리디 선택

**Update Match Score** (src/app/api/matches/[id]/score/route.ts)

- `PUT /api/matches/:id/score` - 매치 점수 업데이트
  - 파라미터: `team1Score`, `team2Score`
  - 응답: 업데이트된 매치 정보

**Player Statistics** (src/app/api/stats/players/route.ts)

- `GET /api/stats/players` - 플레이어 통계 조회
  - 쿼리 파라미터: `playerId` (선택)
  - 응답: 총 게임 수, 승리/패배 횟수

### 알고리즘 특징

- **가중치**: 실력 30%, 성별 25%, 게임 수 25%, 상대 10%, 파트너 10%
- **복잡도**: O(C(n,4) × 3) - 10-20명 플레이어 처리 시 밀리초 단위
- **하드 제약**: 같은 라운드에 동일 플레이어 2회 참여 불가
- **지원 형식**: Doubles, Singles
- **테스트**: Vitest 기반 단위 테스트 2개

---

## Phase 4: 프론트엔드 UI

(예정)

## Phase 5: 통계 및 마무리

(예정)

## Phase 6: 배포

(예정)

---

## 다음 작업

1. 프론트엔드 UI 컴포넌트 개발 (참가자 관리, 이벤트 생성, 대진 생성)
2. 데이터베이스 실제 연결 및 데이터 적용
3. E2E 테스트 추가

## 실행 방법

```bash
# 개발 서버 시작
pnpm dev

# 린트 검사
pnpm lint

# 코드 포맷팅
pnpm format

# 단위 테스트 실행
pnpm test

# E2E 테스트 실행
pnpm test:e2e

# Prisma 스키마 검증
pnpm exec prisma validate
```

## 메모

- Prisma 5 사용 (7과 호환성 문제로 다운그레이드)
- DATABASE_URL 환경 변수 설정 필요 (.env 파일)
- 모바일 퍼스트 반응형 디자인 적용 예정
- Vite + Vitest를 사용하여 빠른 테스트 실행
