# Threads 프로필 조회

Threads 서버 자격증명을 사용해 프로필 정보를 가져옵니다. 프론트엔드에서 아바타를 렌더링할 때 사용합니다.

- **URL**: `/threads/profile`
- **Method**: `GET`
- **Headers**: `Content-Type: application/json`
- **인증**: JWT/쿠키 기반 Threads 인증 필요 (가드가 `threadsUserId`를 주입하고 DB의 long-lived token으로 호출)

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
  - **Code**: 401 (인증/토큰 누락) 또는 500 (Threads API 실패)
    ```json
    {
      "success": false,
      "error": "Failed to fetch Threads profile"
    }
    ```
