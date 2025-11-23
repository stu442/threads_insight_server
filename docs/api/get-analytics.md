# 사용자 분석 조회

사용자의 전체 통계와 주간 분석 데이터를 조회합니다.

- **URL**: `/analytics`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (string, 필수): Threads 사용자 ID

  **요청 예시**:
  `GET /analytics?userId=123456789`

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "totalPosts": 42,
        "weeklyStats": {
          "period": {
            "from": "2025-11-16T06:21:30.000Z",
            "to": "2025-11-23T06:21:30.000Z"
          },
          "totalPosts": 7,
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
- **weeklyStats**: 최근 7일간의 통계
  - 기간 정보
  - 주간 게시물 수
  - 총 좋아요 수
  - 평균 인게이지먼트 비율
- **posts**: 주간 게시물 목록 및 각 게시물의 상세 지표
