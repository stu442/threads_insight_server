# 대시보드 진입 시 데이터 동기화 & 분석 (`POST /sync`)

대시보드 진입 전에 사용자의 Threads 데이터를 수집하고(최초는 전체, 이후는 증분) 바로 분석까지 수행합니다.  
성공적으로 완료될 때까지 DB 변경은 트랜잭션으로 묶이며, 분석 단계에서 실패하면 새로 생성된 포스트/인사이트는 정리됩니다.  
프론트엔드가 `localStorage` 기준 10분 쿨다운을 적용하여 /sync 호출 빈도를 줄입니다(서버는 쿨다운 없음).

## 요청

- Method: `POST`
- Path: `/sync`
- Auth: JWT 쿠키(`threads_auth`), 혹은 개발 모드에서 `THREADS_AUTH_DISABLE=true`
- Body: 없음

## 동작

- 기존 포스트가 없으면 `collect/full` 수준으로 모든 포스트를 수집.
- 기존 포스트가 있으면 최근 7일간 게시물만 증분 수집(최대 100개, `recentDays: 7`).
- 대시보드 진입 시 프론트는 `localStorage`에 마지막 동기화 시각을 기록하고, 10분 이내면 /sync를 생략하고 바로 데이터 조회로 진행합니다.
- 수집 직후 같은 트랜잭션으로 `analyze`를 실행하여 분석값을 저장.
- 분석 단계에서 실패하면 새로 생성된 포스트/인사이트/애널리틱스는 정리.
- 기존 포스트가 있는 경우 1차 호출은 `mode: skipped`로 빠르게 응답하고, 백그라운드에서 증분 수집/분석을 실행합니다(`backgroundSyncStarted: true`).

## 응답 예시

```json
{
  "success": true,
  "mode": "incremental",
  "collectedCount": 24,
  "analyzedCount": 24,
  "skippedCount": 0,
  "touchedPostIds": ["123", "456"],
  "backgroundSyncStarted": false
}
```

- `mode`: `full`(최초 전체 수집) | `incremental`(최근 7일 이내, 최대 100개) | `skipped`(빠른 응답 후 백그라운드 실행)
- `touchedPostIds`: 이번 동기화에 포함된 포스트 ID 목록
- `backgroundSyncStarted`: `true`이면 백그라운드 증분 동기화가 예약됨 (대시보드 UI는 즉시 사용 가능)
