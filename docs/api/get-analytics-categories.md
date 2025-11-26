# 카테고리별 반응 분석 조회

특정 사용자의 게시물을 카테고리 기준으로 묶어 평균/총합 반응 지표를 조회합니다.

- **URL**: `/analytics/categories`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (string, 필수): Threads 사용자 ID

**요청 예시**  
`GET /analytics/categories?userId=123456789`

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": [
        {
          "category": "Sports",
          "count": 4,
          "avgViews": 2100,
          "avgLikes": 180,
          "avgReplies": 25,
          "totalViews": 8400,
          "totalLikes": 720,
          "totalReplies": 100
        },
        {
          "category": "Uncategorized",
          "count": 2,
          "avgViews": 950,
          "avgLikes": 40,
          "avgReplies": 6,
          "totalViews": 1900,
          "totalLikes": 80,
          "totalReplies": 12
        }
      ]
    }
    ```

- **에러 응답**:
  - **Code**: 500
    ```json
    {
      "success": false,
      "error": "Failed to retrieve category metrics"
    }
    ```

## 설명

사용자 게시물을 카테고리별로 집계해 아래 지표를 제공합니다.

- `count`: 해당 카테고리에 속한 게시물 수 (분류되지 않은 경우 `Uncategorized`)
- `avgViews`, `avgLikes`, `avgReplies`: 게시물당 평균 반응(반올림)
- `totalViews`, `totalLikes`, `totalReplies`: 총합 반응

응답은 조회수 합계 내림차순, 동일할 경우 카테고리명 오름차순으로 정렬됩니다.
