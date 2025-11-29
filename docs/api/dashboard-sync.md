# 대시보드 진입 시 데이터 동기화 & 분석 (`POST /sync`)

대시보드 진입 전에 사용자의 Threads 데이터를 수집하고(최초는 전체, 이후는 증분) 바로 분석까지 수행합니다.  
성공적으로 완료될 때까지 DB 변경은 트랜잭션으로 묶이며, 분석 단계에서 실패하면 새로 생성된 포스트/인사이트는 정리됩니다.

## 요청

- Method: `POST`
- Path: `/sync`
- Auth: JWT 쿠키(`threads_auth`), 혹은 개발 모드에서 `THREADS_AUTH_DISABLE=true`
- Body: 없음

## 동작

- 기존 포스트가 없으면 `collect/full` 수준으로 모든 포스트를 수집.
- 이미 분석된 포스트가 있으면 `collect`로 최근 포스트만 갱신.
- 수집 직후 같은 트랜잭션으로 `analyze`를 실행하여 분석값을 저장.
- 분석 단계에서 실패하면 새로 생성된 포스트/인사이트/애널리틱스는 정리.

## 응답 예시

```json
{
  "success": true,
  "mode": "full",
  "collectedCount": 128,
  "analyzedCount": 126,
  "skippedCount": 2,
  "touchedPostIds": ["123", "456", "..."]
}
```

- `mode`: `full`(최초 전체 수집) | `incremental`(최근 N개)
- `touchedPostIds`: 이번 동기화에 포함된 포스트 ID 목록
