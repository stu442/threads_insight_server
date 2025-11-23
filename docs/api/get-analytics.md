# 사용자 분석 조회

사용자의 전체 통계와 특정 기간(기본값: 최근 7일)의 분석 데이터를 조회합니다.

- **URL**: `/analytics`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (string, 필수): Threads 사용자 ID
  - `startDate` (string, 선택): 조회 시작 날짜 (ISO 8601, 예: `2025-01-01`)
  - `endDate` (string, 선택): 조회 종료 날짜 (ISO 8601, 예: `2025-12-31`)
  - `sortBy` (string, 선택): 정렬 기준 (`date`, `views`, `likes`, `engagement`, 기본값: `date`)
  - `sortOrder` (string, 선택): 정렬 순서 (`asc`, `desc`, 기본값: `desc`)

  **요청 예시**:
  `GET /analytics?userId=123456789&startDate=2025-01-01&sortBy=views`

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "totalPosts": 42,
        "periodStats": {
          "period": {
            "from": "2025-11-16T06:21:30.000Z",
            "to": "2025-11-23T06:21:30.000Z"
          },
          "postCount": 7,
          "totalLikes": 250,
          "averageEngagement": 12.45
        },
        "posts": [
          {
            "id": "1234567890",
            "caption": "게시물 내용",
            "permalink": "https://www.threads.net/@username/post/1234567890",
            "timestamp": "2025-11-22T10:00:00.000Z",
            "metrics": {
              "views": 1000,
              "likes": 50,
              "replies": 10,
              "reposts": 5,
              "quotes": 2,
              "engagement": 15.25
            }
          }
        ]
      }
    }
    ```

- **에러 응답**:
  - **Code**: 400 (userId 누락)
    ```json
    {
      "success": false,
      "error": "userId is required as a query parameter"
    }
    ```
  - **Code**: 500 (서버 에러)
    ```json
    {
      "success": false,
      "error": "Failed to retrieve analytics"
    }
    ```

## 설명

이 엔드포인트는 다음 데이터를 제공합니다:

- **totalPosts**: 사용자의 전체 게시물 수 (리포스트 제외)
- **periodStats**: 선택된 기간(기본 7일)의 통계
  - 기간 정보
  - 해당 기간 게시물 수
  - 총 좋아요 수
  - 평균 인게이지먼트 비율
- **posts**: 해당 기간의 게시물 목록 및 각 게시물의 상세 지표 (정렬 옵션 적용)
