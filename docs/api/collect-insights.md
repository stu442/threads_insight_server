# 인사이트 수집

Threads API로부터 인사이트를 수집하고 데이터베이스에 저장합니다.

- **URL**: `/collect`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  - `token` (string, 필수): Threads API 액세스 토큰
  - `userId` (string, 필수): Threads 사용자 ID
  - `limit` (number, 선택): 가져올 게시물 수. 기본값은 10

  **요청 예시**:
  ```json
  {
    "token": "your_threads_access_token",
    "userId": "your_threads_user_id",
    "limit": 5
  }
  ```

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Collected insights for 5 posts"
    }
    ```

- **에러 응답**:
  - **Code**: 400 (필수 필드 누락)
    ```json
    {
      "success": false,
      "error": "token and userId are required in request body"
    }
    ```
  - **Code**: 500 (서버 에러)
    ```json
    {
      "success": false,
      "error": "Failed to collect insights"
    }
    ```
