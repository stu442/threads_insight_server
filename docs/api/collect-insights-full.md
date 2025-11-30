# 전체 인사이트 수집

Threads API로부터 **모든 게시물**의 인사이트를 수집하고 데이터베이스에 저장합니다. 페이징을 자동으로 따라가며 전체 데이터를 가져옵니다.

> **주의**: 이 엔드포인트는 모든 페이지를 순회하므로 실행 시간이 오래 걸릴 수 있습니다. 최초 설정 시에만 사용하는 것을 권장합니다.

## 엔드포인트 정보

- **URL**: `/collect/full`
- **Method**: `GET`
- **인증**: 로그인한 Threads 사용자의 토큰 사용 (JWT/쿠키 기반 인증 필수)

## 요청 예시

```bash
curl "http://localhost:3001/collect/full"
```

## 성공 응답

**Code**: `200 OK`

**Content**:
```json
{
  "success": true,
  "message": "Collected insights for 247 posts (full sync)"
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
  "error": "Failed to collect all insights"
}
```

## 동작 방식

1. Threads API에 `limit=100`으로 첫 요청 전송
2. 응답의 `paging.next` URL 확인
3. `paging.next`가 존재하면 해당 URL로 다음 페이지 요청
4. 모든 페이지를 순회 (`paging.next`가 없을 때까지)
5. 수집된 모든 게시물의 인사이트를 DB에 저장

## 사용 시나리오

### 최초 설정
처음 시스템을 설정할 때 모든 과거 게시물을 가져옵니다.

```bash
# 첫 실행
curl "http://localhost:3001/collect/full"
```

### 전체 재동기화
무언가 문제가 발생하여 전체 데이터를 다시 동기화해야 할 때

```bash
# 전체 재동기화
curl "http://localhost:3001/collect/full"
```

## 성능 고려사항

- **실행 시간**: 게시물 수에 따라 수분에서 수십 분 소요 가능
- **API 호출 수**: 게시물이 1000개라면 약 10회의 API 호출 발생 (페이지당 100개)
- **Rate Limiting**: Threads API의 rate limit을 고려하여 사용
- **타임아웃**: 게시물이 많은 경우 클라이언트 타임아웃 설정 필요

## 참고사항

- 이미 DB에 존재하는 게시물은 `upsert`로 업데이트되므로 중복 걱정 없음
- 인사이트가 없는 게시물(최근 생성된 게시물 등)은 카운트에 포함되지 않음
- 일반적인 업데이트에는 [증분 수집](./collect-insights.md)을 사용하는 것을 권장

## 관련 엔드포인트

- [증분 인사이트 수집](./collect-insights.md) - 최신 N개만 가져오기
