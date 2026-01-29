# 데이터베이스 설정 가이드

## 옵션 1: 로컬 PostgreSQL (개발용)

### macOS (Homebrew)

```bash
# PostgreSQL 설치
brew install postgresql@14

# PostgreSQL 시작
brew services start postgresql@14

# 데이터베이스 생성
createdb tennis_matcher

# 연결 확인
psql tennis_matcher
```

### Ubuntu/Debian

```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql

# 사용자로 전환
sudo -u postgres psql

# 데이터베이스 생성
CREATE DATABASE tennis_matcher;
CREATE USER tennis_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tennis_matcher TO tennis_user;
```

### Windows

1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 설치
2. pgAdmin 또는 명령줄로 데이터베이스 생성

### 환경 변수 설정

`.env` 파일 생성:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tennis_matcher?schema=public"
```

### Prisma 마이그레이션 실행

```bash
# Prisma 클라이언트 생성
pnpm db:generate

# 스키마 적용
pnpm db:push

# 시드 데이터 추가 (선택사항)
pnpm db:seed
```

---

## 옵션 2: Supabase (무료 클라우드)

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. 리전 선택 (Northeast Asia - Seoul 권장)
4. 데이터베이스 비밀번호 설정

### 2. 연결 문자열 복사

프로젝트 설정 → Database → Connection String → URI 복사

예시:
```
postgresql://postgres.xyz:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3. 환경 변수 설정

`.env` 파일:

```env
DATABASE_URL="postgresql://postgres.xyz:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**주의**: `?pgbouncer=true`와 `connection_limit=1` 파라미터 필수

### 4. Prisma 설정

```bash
# Prisma 클라이언트 생성
pnpm db:generate

# 스키마 적용
pnpm db:push

# 시드 데이터
pnpm db:seed
```

### Supabase 무료 티어 제한

- 스토리지: 500MB
- 데이터베이스 행: 무제한
- API 요청: 무제한
- 월 대역폭: 5GB

---

## 옵션 3: Neon (서버리스 PostgreSQL)

### 1. Neon 프로젝트 생성

1. [Neon](https://neon.tech) 접속
2. 새 프로젝트 생성
3. 리전 선택

### 2. 연결 문자열 복사

Dashboard → Connection Details → Connection String

### 3. 환경 변수 설정

```env
DATABASE_URL="postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"
```

### 4. Prisma 마이그레이션

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

---

## 데이터베이스 확인

### Prisma Studio 실행

```bash
pnpm db:studio
```

브라우저에서 `http://localhost:5555` 접속하여 데이터 확인

### psql로 직접 확인

```bash
psql $DATABASE_URL

# 테이블 목록
\dt

# Player 테이블 조회
SELECT * FROM "Player";

# Event 테이블 조회
SELECT * FROM "Event";
```

---

## 문제 해결

### 연결 오류

```bash
# 연결 테스트
psql $DATABASE_URL

# Prisma 연결 확인
pnpm exec prisma db pull
```

### 마이그레이션 리셋

```bash
# 경고: 모든 데이터가 삭제됩니다!
pnpm exec prisma migrate reset

# 또는
pnpm exec prisma db push --force-reset
```

### 시드 데이터 재생성

```bash
pnpm db:seed
```

---

## 프로덕션 배포 시 권장사항

1. **Supabase 또는 Neon** 사용 (무료 티어 충분)
2. **환경 변수**를 Vercel에 설정
3. **Connection Pooling** 활성화 (서버리스 환경)
4. **백업** 설정 (Supabase/Neon 자동 백업 제공)

---

## 데이터베이스 스키마

현재 프로젝트의 스키마는 다음과 같습니다:

- **Player**: 참가자 정보
- **Event**: 이벤트/모임
- **EventParticipant**: 이벤트-참가자 관계
- **Match**: 경기 정보
- **MatchPlayer**: 경기-참가자 관계

자세한 스키마는 `prisma/schema.prisma` 참조
