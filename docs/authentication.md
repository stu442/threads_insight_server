# Authentication & Threads OAuth

정리: Threads OAuth로 authorization code → short-lived token → long-lived token을 교환하고, 내부 JWT(threads_auth 쿠키)로 프론트 사용자를 식별합니다. 전역 가드로 대부분의 API가 보호되며, 로컬에서는 우회 플래그로 인증을 끌 수 있습니다.

## 전체 플로우
1) 프론트에서 Threads 로그인 → Threads가 `THREADS_REDIRECT_URI`로 `code`, `state`를 전달.
2) 백엔드 `/threads/auth/callback`:
   - code → short-lived token(POST https://graph.threads.net/oauth/access_token)
   - short → long-lived token(GET https://graph.threads.net/access_token?grant_type=th_exchange_token)
   - DB upsert(User.threadsUserId, threadsLongLivedToken, threadsTokenExpiresAt)
   - 내부 JWT 발급 후 `threads_auth` HttpOnly 쿠키로 설정 → `THREADS_POST_AUTH_REDIRECT_URL`로 302
3) 프론트는 쿠키를 자동 전송(`credentials: 'include'`)하고 `/threads/auth/me`로 현재 유저(threadsUserId)를 조회.
4) 보호된 API들은 JWT를 요구(전역 가드). 필요 시 화이트리스트에 추가.

## 주요 엔드포인트
- `GET /threads/auth/url` : authorize URL + state 생성(현재 state 검증은 TODO)
- `GET /threads/auth/callback` : code 처리, 토큰 교환, DB upsert, JWT 쿠키 설정, 성공/실패 리다이렉트
- `POST /threads/auth/token` : 수동 code→short 교환
- `POST /threads/auth/token/long` : short→long 교환
- `GET /threads/auth/me` : JWT(Bearer 또는 threads_auth 쿠키) 검증 후 `threadsUserId` 반환

## 전역 가드(JWT)
- `ThreadsAuthGuard`가 `/ping`, `/threads/auth/*`, `/api-docs` 제외 모든 라우트에 JWT 검증 적용.
- 쿠키 이름: `threads_auth` (HttpOnly, 기본 SameSite=Lax, prod에서 Secure, maxAge=JWT 만료. 필요 시 `THREADS_AUTH_COOKIE_SAMESITE`/`THREADS_AUTH_COOKIE_DOMAIN`으로 조절).
- 토큰은 HS256 수동 서명: payload { sub: threadsUserId, iat, exp }.

## 환경 변수
- 필수: `THREADS_CLIENT_ID`, `THREADS_CLIENT_SECRET`, `THREADS_REDIRECT_URI`
- 리다이렉트: `THREADS_POST_AUTH_REDIRECT_URL` (성공 시), `THREADS_POST_AUTH_ERROR_REDIRECT_URL` (실패 시)
- JWT: `THREADS_AUTH_JWT_SECRET`(필수), `THREADS_AUTH_JWT_EXPIRES_IN`(선택, 초 단위, 기본 3600)
- 쿠키: `THREADS_AUTH_COOKIE_SAMESITE`(`lax`/`none`/`strict`, 기본 `lax`), `THREADS_AUTH_COOKIE_DOMAIN`(선택, 쿠키 도메인 지정)
- CORS: `CORS_ORIGIN`(쉼표 구분 origin 리스트), 없으면 origin: true
- 개발 우회: `THREADS_AUTH_DISABLE=true` → 가드 스킵(로컬 전용)

## 프론트 통합 팁
- `fetch/axios` 호출 시 `credentials: 'include'` 필수(쿠키 전달).
- 페이지 진입 시 `/threads/auth/me`로 유저 상태 로드, 실패하면 로그인 페이지로 리다이렉트.
- `NEXT_PUBLIC_API_URL`을 백엔드 호스트/포트로 맞추고, 쿠키 도메인이 일치해야 브라우저가 쿠키를 전송합니다. 프론트/백엔드 도메인이 다르면 `THREADS_AUTH_COOKIE_SAMESITE=none`(+HTTPS)와 적절한 `THREADS_AUTH_COOKIE_DOMAIN` 설정이 필요합니다.

## Threads 설정 체크리스트
- Threads 개발자 콘솔에 `THREADS_REDIRECT_URI`로 쓰는 모든 도메인/로컬 URL 등록.
- OAuth scope: 기본 `threads_basic,threads_manage_insights`.

## 마이그레이션/DB
- `User` 테이블: `threadsUserId`(unique), `threadsLongLivedToken`, `threadsTokenExpiresAt`, timestamps.
- 배포 시 `npx prisma migrate deploy` 필요. 실패한 migration(P3009 등) 시 `prisma migrate resolve --rolled-back <name>` 후 재배포.

## 로컬 개발
- 인증 없이 빠르게 테스트: `.env`에 `THREADS_AUTH_DISABLE=true` 설정 후 서버 재시작.
- 실제 OAuth 테스트: Threads 콘솔에 로컬 redirect 등록 후 `THREADS_REDIRECT_URI`와 프론트 도메인을 맞춘다.
