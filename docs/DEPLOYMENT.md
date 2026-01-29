# Vercel 배포 가이드

## 사전 준비

### 1. GitHub 저장소 생성

```bash
# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/yourusername/tennis-matcher.git
git branch -M main
git push -u origin main
```

### 2. 데이터베이스 준비

Supabase 또는 Neon에서 PostgreSQL 데이터베이스 생성
([DATABASE_SETUP.md](./DATABASE_SETUP.md) 참조)

---

## Vercel 배포 (자동)

### 1. Vercel 계정 생성

[Vercel](https://vercel.com) 접속 후 GitHub 계정으로 로그인

### 2. 프로젝트 Import

1. **New Project** 클릭
2. GitHub 저장소 선택 (tennis-matcher)
3. **Import** 클릭

### 3. 환경 변수 설정

**Environment Variables** 섹션에서 추가:

```
DATABASE_URL = postgresql://user:pass@host:5432/db?pgbouncer=true
```

**중요**: Supabase 사용 시 `?pgbouncer=true&connection_limit=1` 필수

### 4. 배포 설정

- **Framework Preset**: Next.js (자동 감지됨)
- **Build Command**: `pnpm build` (기본값)
- **Output Directory**: `.next` (기본값)

### 5. Deploy 클릭

약 2-3분 후 배포 완료

---

## Vercel CLI 배포 (수동)

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. 로그인

```bash
vercel login
```

### 3. 환경 변수 설정

```bash
# 프로덕션 환경 변수
vercel env add DATABASE_URL production

# 값 입력: postgresql://...
```

### 4. 배포

```bash
# 프로덕션 배포
vercel --prod
```

---

## 배포 후 확인 사항

### 1. 데이터베이스 마이그레이션

Vercel은 자동으로 빌드 시 Prisma를 생성하지만, 스키마 적용은 수동으로 필요할 수 있습니다.

**로컬에서 프로덕션 DB에 마이그레이션**:

```bash
# .env를 프로덕션 DATABASE_URL로 설정
DATABASE_URL="프로덕션_URL" pnpm db:push

# 시드 데이터 (선택사항)
DATABASE_URL="프로덕션_URL" pnpm db:seed
```

### 2. 애플리케이션 테스트

배포된 URL에서 확인:

- ✅ 홈페이지 로딩
- ✅ 참가자 생성/조회
- ✅ 이벤트 생성
- ✅ 대진 생성
- ✅ 통계 조회

### 3. Vercel 로그 확인

```bash
vercel logs
```

또는 Vercel Dashboard → Deployments → Logs

---

## 환경 변수 관리

### 개발/프로덕션 분리

```bash
# 개발 환경
vercel env add DATABASE_URL development

# 프리뷰 환경
vercel env add DATABASE_URL preview

# 프로덕션 환경
vercel env add DATABASE_URL production
```

### 환경 변수 목록 확인

```bash
vercel env ls
```

### 환경 변수 제거

```bash
vercel env rm DATABASE_URL production
```

---

## 자동 배포 설정

### GitHub Integration

Vercel이 GitHub와 연동되면 자동으로:

- **main 브랜치** → 프로덕션 배포
- **feature 브랜치** → 프리뷰 배포
- **PR 생성** → 프리뷰 URL 자동 생성

### 배포 무시하기

특정 파일 변경 시 배포 스킵:

`vercel.json` 생성:

```json
{
  "github": {
    "silent": true
  },
  "git": {
    "deploymentEnabled": {
      "main": true,
      "preview": true
    }
  }
}
```

---

## 커스텀 도메인 설정

### 1. Vercel Dashboard

Project → Settings → Domains

### 2. 도메인 추가

1. 도메인 입력 (예: tennismatcher.com)
2. DNS 설정 안내 확인

### 3. DNS 설정 (도메인 제공업체)

**A 레코드**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME 레코드**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서 발급

---

## 성능 최적화

### 1. 이미지 최적화

Next.js Image 컴포넌트 사용 (이미 적용됨)

### 2. 캐싱 설정

Vercel이 자동으로 최적 캐싱 적용:
- 정적 파일: 영구 캐싱
- API 응답: 캐시 헤더에 따름

### 3. Edge Functions (선택)

빠른 응답이 필요한 API를 Edge로 전환:

```typescript
// src/app/api/some-route/route.ts
export const runtime = 'edge';
```

---

## 모니터링

### Vercel Analytics

Project Settings → Analytics → Enable

무료 티어:
- 페이지 뷰: 무제한
- 성능 메트릭
- Web Vitals

### 로그 확인

```bash
# 실시간 로그
vercel logs --follow

# 특정 배포 로그
vercel logs <deployment-url>
```

---

## 문제 해결

### 빌드 실패

```bash
# 로컬에서 프로덕션 빌드 테스트
pnpm build

# Prisma 클라이언트 생성 확인
pnpm db:generate
```

### 데이터베이스 연결 오류

1. 환경 변수 확인 (`DATABASE_URL`)
2. Connection pooling 파라미터 확인
3. IP 화이트리스트 확인 (Supabase 등)

### Serverless Function Timeout

Vercel 무료 티어: 10초 제한
Pro 티어: 60초 제한

대진 생성이 느릴 경우 최적화 필요

---

## 배포 체크리스트

- [ ] GitHub 저장소 생성 및 푸시
- [ ] Supabase/Neon 데이터베이스 생성
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정 (`DATABASE_URL`)
- [ ] 배포 실행
- [ ] 데이터베이스 마이그레이션 (`db:push`)
- [ ] 시드 데이터 추가 (선택)
- [ ] 애플리케이션 테스트
- [ ] 커스텀 도메인 설정 (선택)
- [ ] Analytics 활성화 (선택)

---

## 비용

### Vercel 무료 티어

- 프로젝트: 무제한
- 대역폭: 100GB/월
- 빌드 시간: 6,000분/월
- Serverless Functions: 100GB-시간/월

### Supabase 무료 티어

- 스토리지: 500MB
- 대역폭: 5GB/월

**소규모 테니스 동호회(10-20명)에는 무료 티어로 충분합니다.**

---

## 추가 자료

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Prisma 프로덕션 가이드](https://www.prisma.io/docs/guides/deployment)
