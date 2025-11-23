# 인사이트 조회

데이터베이스에서 저장된 게시물과 최신 인사이트를 조회합니다.

- **URL**: `/insights`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (string, 필수): 게시물을 필터링할 Threads 사용자 ID
  - `limit` (number, 선택): 조회할 게시물 수. 기본값은 10

  **요청 예시**:
  `GET /insights?userId=123456789&limit=5`

- **성공 응답**:
  - **Code**: 200
  - **Content**: 게시물 객체 배열
    ```json
    [
      {
        "id": "1234567890",
        "userId": "123456789",
        "caption": "This is a post caption",
        "permalink": "https://www.threads.net/@username/post/1234567890",
        "mediaType": "IMAGE",
        "username": "username",
        "timestamp": "2023-10-27T10:00:00.000Z",
        "insights": [
          {
            "id": 1,
            "postId": "1234567890",
            "views": 100,
            "likes": 10,
            "replies": 2,
            "reposts": 1,
            "quotes": 0,
            "timestamp": "2023-10-27T10:05:00.000Z"
          }
        ]
      }
    ]
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
      "error": "Failed to retrieve insights"
    }
    ```
