# Vercel 환경 변수 확인 방법

## 방법 1: Vercel 대시보드에서 확인 (가장 쉬움)

1. https://vercel.com/dashboard 접속
2. `tennis-matcher` 프로젝트 클릭
3. 상단 탭에서 **Settings** 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭

### 확인 사항:

```
변수명: DATABASE_URL
환경: Production (체크되어 있어야 함)
값: postgresql://... (실제 값이 설정되어 있어야 함)
```

### ❌ 문제 1: DATABASE_URL이 없는 경우

**Add New** 버튼 클릭 후 추가:
- Name: `DATABASE_URL`
- Value: `postgresql://postgres.[PROJECT]:PASSWORD@[HOST]:6543/postgres?pgbouncer=true&connection_limit=1`
- Environment: Production 체크

### ❌ 문제 2: DATABASE_URL이 있지만 형식이 잘못된 경우

Supabase를 사용한다면 **반드시** Connection Pooling URL을 사용해야 합니다:

**잘못된 예 (Direct connection):**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**올바른 예 (Connection pooling):**
```
postgresql://postgres.xxx:password@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Supabase에서 올바른 URL 가져오기:

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Database** 클릭
4. "Connection string" 섹션에서 **Connection pooling** 탭 선택
5. **URI** 모드로 변경
6. 표시된 URL 복사
7. `[YOUR-PASSWORD]`를 실제 데이터베이스 비밀번호로 교체

## 방법 2: Vercel CLI로 확인

```bash
# Vercel CLI 설치 (없는 경우)
npm install -g vercel

# Vercel 로그인
vercel login

# 프로젝트에 링크
cd /Users/dreamus_01/Desktop/workspaces_ksh/tennis-matcher
vercel link

# 환경 변수 목록 확인
vercel env ls

# DATABASE_URL 값 확인 (production)
vercel env pull .env.vercel.production
cat .env.vercel.production
```

## 환경 변수 설정 후 해야 할 것

### 1. 데이터베이스 스키마 적용

```bash
# Vercel에 설정한 DATABASE_URL로 스키마 적용
DATABASE_URL="여기에_vercel_설정한_url_붙여넣기" pnpm db:push
```

### 2. Vercel 재배포

환경 변수를 추가/변경했다면 **반드시 재배포**해야 합니다:

**대시보드에서:**
1. Deployments 탭
2. 최신 배포 오른쪽 "..." 메뉴
3. **Redeploy** 클릭

**Git push로:**
```bash
git commit --allow-empty -m "chore: trigger redeploy after env setup"
git push origin main
```

## 재배포 후 테스트

```bash
# API 테스트
curl https://tennis-matcher-j0mfmff6n-shinhus-projects.vercel.app/api/players
```

성공 시:
```json
{
  "data": []
}
```

실패 시 (500 에러):
```json
{
  "error": "Failed to fetch players"
}
```

## Vercel 로그 확인 방법

### 대시보드에서:
1. 프로젝트 → **Deployments**
2. 최신 배포 클릭
3. **Functions** 탭 클릭
4. `/api/players` 클릭하여 로그 확인

### CLI에서:
```bash
vercel logs --follow
```

## 흔한 에러 메시지

### "Environment variable not found: DATABASE_URL"
→ Vercel에서 DATABASE_URL 설정 안 됨

### "Can't reach database server"
→ DATABASE_URL이 잘못되었거나 데이터베이스가 꺼져있음

### "prepared statement already exists"
→ CONNECTION_URL에 `?pgbouncer=true` 없음

### "relation \"Player\" does not exist"
→ 데이터베이스에 스키마가 적용 안 됨 (`pnpm db:push` 실행 필요)
