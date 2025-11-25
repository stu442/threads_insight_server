# Threads 프로필 조회

Threads 서버 자격증명을 사용해 프로필 정보를 가져옵니다. 프론트엔드에서 아바타를 렌더링할 때 사용합니다.

- **URL**: `/threads/profile`
- **Method**: `GET`
- **Headers**: `Content-Type: application/json`
- **환경 변수 (백엔드)**:
  - `THREADS_ACCESS_TOKEN`: Threads API 액세스 토큰 (서버 전용)
  - `THREADS_USER_ID`: 프로필을 조회할 Threads 사용자 ID

- **요청 예시**:
  ```
  GET /threads/profile
  ```

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "1234567890",
        "username": "thread_user",
        "name": "Thread User",
        "avatar": "https://scontent.cdninstagram.com/path/to/avatar.jpg"
      }
    }
    ```

- **에러 응답**:
  - **Code**: 500 (설정 누락 혹은 Threads API 실패)
    ```json
    {
      "success": false,
      "error": "Failed to fetch Threads profile"
    }
    ```
