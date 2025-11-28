# 시간대별 반응 분석 조회

특정 사용자의 게시물을 시간대별(0시~23시)로 묶어 평균 반응 지표를 조회합니다.

- **URL**: `/analytics/time-of-day`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (string, 필수): Threads 사용자 ID

**요청 예시**
`GET /analytics/time-of-day?userId=123456789`

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": [
        {
          "hour": 0,
          "count": 15,
          "avgViews": 120,
          "avgLikes": 10,
          "avgReplies": 2,
          "avgReposts": 1
        },
        {
          "hour": 1,
          "count": 5,
          "avgViews": 80,
          "avgLikes": 5,
          "avgReplies": 0,
          "avgReposts": 0
        },
        ...
        {
          "hour": 23,
          "count": 20,
          "avgViews": 250,
          "avgLikes": 25,
          "avgReplies": 5,
          "avgReposts": 3
        }
      ]
    }
    ```

- **에러 응답**:
  - **Code**: 500
    ```json
    {
      "success": false,
      "error": "Failed to retrieve time of day analytics"
    }
    ```

## 설명

사용자의 게시물을 작성 시간(0시~23시) 기준으로 집계하여 아래 지표를 제공합니다. 이를 통해 가장 반응이 좋은 시간대를 파악할 수 있습니다.

- `hour`: 시간대 (0 ~ 23)
- `count`: 해당 시간대에 작성된 게시물 수
- `avgViews`, `avgLikes`, `avgReplies`, `avgReposts`: 게시물당 평균 반응(반올림)

응답은 0시부터 23시까지 시간 순서대로 정렬되어 반환됩니다. 해당 시간대에 게시물이 없는 경우 카운트와 평균값은 0으로 반환됩니다.
