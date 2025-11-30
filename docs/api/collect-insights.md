# 인사이트 수집 (증분)

Threads API로부터 최신 게시물의 인사이트를 수집하고 데이터베이스에 저장합니다.

> **참고**: 전체 동기화가 필요한 경우 [전체 인사이트 수집](./collect-insights-full.md)을 사용하세요.

## 엔드포인트 정보

- **URL**: `/collect`
- **Method**: `GET`
- **인증**: 로그인한 Threads 사용자의 토큰 사용 (JWT/쿠키 기반 인증 필수)

## 요청 파라미터

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| `limit` | number | 선택 | 100 | 가져올 최신 게시물 수 (최대 100) |
| `userId` | string | 선택 | - | 특정 Threads 사용자 ID 지정 (없으면 인증된 사용자) |

## 요청 예시

### 기본 요청 (최신 100개)
```bash
curl "http://localhost:3001/collect"
```

### limit 지정 (최신 10개)
```bash
curl "http://localhost:3001/collect?limit=10"
```

### limit 지정 (최신 50개)
```bash
curl "http://localhost:3001/collect?limit=50"
```

## 성공 응답

**Code**: `200 OK`

**Content**:
```json
{
  "success": true,
  "message": "Collected insights for 10 posts"
}
```

## 에러 응답

### 환경 변수 누락
**Code**: `400 Bad Request`

**Content**:
```json
{
  "success": false,
  "error": "Missing Threads token for user"
}
```

### 서버 에러
**Code**: `500 Internal Server Error`

**Content**:
```json
{
  "success": false,
  "error": "Failed to collect insights"
}
```

## 사용 시나리오

### 정기 업데이트
매일 또는 주기적으로 최신 게시물의 인사이트를 업데이트할 때 사용합니다.

```bash
# cron job 예시: 매시간 최신 100개 업데이트
0 * * * * curl "http://localhost:3001/collect"
```

### 제한적 업데이트
API 호출을 절약하거나 빠른 업데이트가 필요할 때 limit을 조정합니다.

```bash
# 빠른 확인용 (최신 5개만)
curl "http://localhost:3001/collect?limit=5"
```

## 참고사항

- 이미 DB에 존재하는 게시물은 `upsert`로 업데이트됩니다
- 게시물별로 인사이트가 없을 수 있습니다 (최근 생성된 게시물 등)
- limit은 Threads API 요청 시 사용되며, 실제 저장되는 게시물 수는 인사이트 존재 여부에 따라 다를 수 있습니다
