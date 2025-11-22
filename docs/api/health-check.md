# 헬스 체크

서버가 정상적으로 실행 중인지 확인합니다.

- **URL**: `/ping`
- **Method**: `GET`
- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": "ok",
      "message": "Server is reachable"
    }
    ```
