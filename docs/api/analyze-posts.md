# 게시물 분석

게시물의 인게이지먼트 지표를 분석하고 데이터베이스에 저장합니다.

- **URL**: `/analyze`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  - `userId` (string, 필수): Threads 사용자 ID
  - `postIds` (array of string, 선택): 분석할 특정 게시물 ID 배열. 미제공 시 모든 게시물 분석

  **요청 예시**:
  ```json
  {
    "userId": "123456789",
    "postIds": ["1234567890", "0987654321"]
  }
  ```

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Analyzed 5 posts",
      "analyzedCount": 5,
      "skippedCount": 0
    }
    ```

- **에러 응답**:
  - **Code**: 400 (필수 필드 누락)
    ```json
    {
      "success": false,
      "error": "userId is required in request body"
    }
    ```
  - **Code**: 500 (서버 에러)
    ```json
    {
      "success": false,
      "error": "Failed to analyze posts"
    }
    ```

## 설명

이 엔드포인트는 게시물의 인사이트 데이터를 기반으로 다음 지표를 계산합니다:

- **총 인게이지먼트**: 좋아요 + 댓글 + 리포스트 + 인용
- **인게이지먼트 비율**: (총 인게이지먼트 / 조회수) × 100

계산된 데이터는 `PostAnalytics` 테이블에 저장되어 향후 빠른 조회와 필터링을 지원합니다.
