# 요일별 반응 분석 조회

특정 사용자의 게시물을 요일별(일요일~토요일)로 묶어 평균 반응 지표를 조회합니다.

- **URL**: `/analytics/day-of-week`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (string, 필수): Threads 사용자 ID

**요청 예시**
`GET /analytics/day-of-week?userId=123456789`

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": [
        {
          "dayIndex": 0,
          "day": "Sun",
          "count": 10,
          "avgViews": 150,
          "avgLikes": 12,
          "avgReplies": 3,
          "avgReposts": 1
        },
        {
          "dayIndex": 1,
          "day": "Mon",
          "count": 5,
          "avgViews": 80,
          "avgLikes": 5,
          "avgReplies": 0,
          "avgReposts": 0
        },
        ...
        {
          "dayIndex": 6,
          "day": "Sat",
          "count": 20,
          "avgViews": 300,
          "avgLikes": 30,
          "avgReplies": 8,
          "avgReposts": 5
        }
      ]
    }
    ```

- **에러 응답**:
  - **Code**: 500
    ```json
    {
      "success": false,
      "error": "Failed to retrieve day of week analytics"
    }
    ```

## 설명

사용자의 게시물을 작성 요일(한국 시간 기준)로 집계하여 아래 지표를 제공합니다. 이를 통해 가장 반응이 좋은 요일을 파악할 수 있습니다.

- `dayIndex`: 요일 인덱스 (0: 일요일 ~ 6: 토요일)
- `day`: 요일 이름 (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
- `count`: 해당 요일에 작성된 게시물 수
- `avgViews`, `avgLikes`, `avgReplies`, `avgReposts`: 게시물당 평균 반응(반올림)

응답은 일요일(0)부터 토요일(6)까지 순서대로 정렬되어 반환됩니다.
