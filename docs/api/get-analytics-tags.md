# 태그별 반응 분석 조회

특정 사용자의 게시물 태그별 평균/총합 반응 지표를 조회합니다.

- **URL**: `/analytics/tags`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (string, 필수): Threads 사용자 ID

**요청 예시**  
`GET /analytics/tags?userId=123456789`

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": [
        {
          "tag": "len-100",
          "count": 3,
          "avgViews": 1200,
          "avgLikes": 45,
          "avgReposts": 8,
          "avgReplies": 5,
          "totalViews": 3600,
          "totalLikes": 135,
          "totalReposts": 24,
          "totalReplies": 15
        }
      ]
    }
    ```

- **에러 응답**:
  - **Code**: 500
    ```json
    {
      "success": false,
      "error": "Failed to retrieve tag correlation"
    }
    ```

## 설명

사용자 게시물의 태그별로 아래 지표를 제공합니다.

- `count`: 해당 태그가 붙은 게시물 수
- `avgViews`, `avgLikes`, `avgReposts`, `avgReplies`: 게시물당 평균 반응(반올림)
- `totalViews`, `totalLikes`, `totalReposts`, `totalReplies`: 총합 반응

태그는 사전순으로 정렬되어 반환됩니다(예: `len-100`, `len-200`, ...).
