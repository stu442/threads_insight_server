# API 문서

Base URL: `http://localhost:3001` (개발) 또는 배포된 URL

## 엔드포인트

### 핵심 기능
- [헬스 체크](./health-check.md)
- [Threads 프로필 조회](./get-threads-profile.md)
- [Threads OAuth (Short-lived Token)](./threads-auth.md)

### 인사이트 수집
- [인사이트 수집 (증분)](./collect-insights.md) - 최신 N개 게시물
- [인사이트 수집 (전체)](./collect-insights-full.md) - 모든 게시물 (페이징)

### 데이터 조회
- [인사이트 조회](./get-insights.md)
- [게시물 분석](./analyze-posts.md)
- [사용자 분석 조회](./get-analytics.md)
- [게시물 라벨 생성 (GPT)](./analytics-label.md)
- [태그별 반응 분석](./get-analytics-tags.md)

## 환경 변수

주요 설정:

- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 URL
- Threads OAuth/JWT 관련: `THREADS_CLIENT_ID`, `THREADS_CLIENT_SECRET`, `THREADS_REDIRECT_URI`, `THREADS_AUTH_JWT_SECRET`, `THREADS_AUTH_JWT_EXPIRES_IN`, `THREADS_SCOPES`
- 개발 편의: `THREADS_AUTH_DISABLE=true` (가드 우회), `THREADS_DEV_USER_ID` (우회 시 더미 사용자 ID)
- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 URL
