# Threads OAuth (Short-lived Token 발급)

Threads 로그인 리다이렉트를 위한 URL 생성과, 돌아온 `code`를 Short-lived Access Token으로 교환하는 엔드포인트입니다.

## 1) Threads 로그인 URL 발급
- **URL**: `/threads/auth/url`
- **Method**: `GET`
- **Headers**: `Content-Type: application/json`
- **환경 변수 (백엔드)**:
  - `THREADS_CLIENT_ID`
  - `THREADS_REDIRECT_URI`
  - `THREADS_SCOPES` (기본: `threads_basic,threads_manage_insights`)
- **설명**: CSRF 방지용 `state`를 생성하고 Threads authorize URL을 조립해 반환합니다. (현재 state 저장/검증은 TODO)
- **요청 예시**:
  ```
  GET /threads/auth/url
  ```
- **성공 응답**:
  ```json
  {
    "success": true,
    "data": {
      "url": "https://threads.net/oauth/authorize?client_id=...&redirect_uri=...&scope=threads_basic,threads_manage_insights&response_type=code&state=abc123",
      "state": "abc123"
    }
  }
  ```

## 1-1) Authorization Code → Short-lived Access Token (직접 교환)
- **URL**: `/threads/auth/token`
- **Method**: `POST`
- **Body (JSON)**:
  - `code` (필수): Threads가 redirect 시 전달하는 authorization code
  - `state` (선택): authorize 시 생성한 state
  - `redirect_uri` (선택): 기본값은 `THREADS_REDIRECT_URI`, 필요 시 override
- **환경 변수 (백엔드)**:
  - `THREADS_CLIENT_ID`
  - `THREADS_CLIENT_SECRET`
  - `THREADS_REDIRECT_URI` (override 없을 때 사용)
- **설명**: 받은 code를 바로 Short-lived Access Token으로 교환합니다.
- **요청 예시**:
  ```bash
  curl -X POST https://<backend>/threads/auth/token \
    -H "Content-Type: application/json" \
    -d '{
      "code": "AUTH_CODE",
      "state": "abc123",
      "redirect_uri": "https://your.app/threads/auth/callback"
    }'
  ```
- **성공 응답**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "SL-ACCESS-TOKEN",
      "user_id": "1234567890",
      "token_type": "bearer",
      "expires_in": 3600,
      "state": "abc123"
    }
  }
  ```

## 2) Authorization Code → Short-lived Access Token 교환
- **URL**: `/threads/auth/callback`
- **Method**: `GET`
- **Query**:
  - `code` (필수): Threads가 redirect 시 전달하는 authorization code
  - `state` (선택): authorize 시 생성한 state (추후 검증용)
- **Headers**: `Content-Type: application/json`
- **환경 변수 (백엔드)**:
  - `THREADS_CLIENT_ID`
  - `THREADS_CLIENT_SECRET`
  - `THREADS_REDIRECT_URI`
- **설명**: `code`를 받아 Threads Graph API에 토큰 교환을 요청해 Short-lived Access Token을 발급한 뒤 Long-lived 토큰으로 교환하고, `threadsUserId` 기준으로 DB(User 테이블)에 upsert 합니다. (state 검증은 추후 추가)
- **요청 예시**:
  ```
  GET /threads/auth/callback?code=AUTH_CODE&state=abc123
  ```
- **성공 응답**:
  ```json
  {
    "success": true,
    "data": {
      "shortLived": {
        "access_token": "SL-ACCESS-TOKEN",
        "user_id": "1234567890",
        "token_type": "bearer",
        "expires_in": 3600
      },
      "longLived": {
        "access_token": "LL-ACCESS-TOKEN",
        "token_type": "bearer",
        "expires_in": 5184000
      },
      "state": "abc123"
    }
  }
  ```
- **에러 응답**:
  ```json
  {
    "success": false,
    "error": "Failed to exchange code for short-lived token"
  }
  ```

## 3) Short-lived Access Token → Long-lived Access Token
- **URL**: `/threads/auth/token/long`
- **Method**: `POST`
- **Body (JSON)**:
  - `access_token` (필수): Short-lived Access Token
- **환경 변수 (백엔드)**:
  - `THREADS_CLIENT_SECRET`
- **설명**: short-lived 토큰을 long-lived 토큰으로 교환합니다. Threads Graph API `GET https://graph.threads.net/access_token`에 `grant_type=th_exchange_token`으로 전달합니다.
- **요청 예시**:
  ```bash
  curl -X POST https://<backend>/threads/auth/token/long \
    -H "Content-Type: application/json" \
    -d '{
      "access_token": "SHORT_LIVED_TOKEN"
    }'
  ```
- **성공 응답**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "LL-ACCESS-TOKEN",
      "token_type": "bearer",
      "expires_in": 5184000
    }
  }
  ```
