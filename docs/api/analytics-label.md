# 게시물 라벨 생성 (GPT)

Threads 게시물 캡션을 GPT로 분석해 카테고리와 태그를 생성하고 저장합니다.

- **URL**: `/analytics/label`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  - `userId` (string, 필수): Threads 사용자 ID
  - `postIds` (array of string, 선택): 라벨링할 특정 게시물 ID 배열. 미제공 시 전체 게시물 대상
  - `force` (boolean, 선택, 기본값: `false`): 기존 라벨이 있어도 재생성할지 여부

  **요청 예시**:
  ```json
  {
    "userId": "123456789",
    "postIds": ["1234567890", "0987654321"],
    "force": false
  }
  ```

- **성공 응답**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Labeled 5 posts",
      "labeledCount": 5,
      "skippedCount": 1,
      "failedCount": 0,
      "failures": []
    }
    ```

- **에러 응답**:
  - **Code**: 500 (서버 에러)
    ```json
    {
      "success": false,
      "error": "Failed to label posts"
    }
    ```

## 설명

이 엔드포인트는 각 게시물의 캡션을 GPT로 분석하여 `PostAnalytics`에 `category`와 `tags`를 저장합니다.

- 캡션이 없거나 공백인 게시물은 건너뜁니다.
- `force`가 `false`이면 기존 카테고리/태그가 있는 게시물은 재처리하지 않습니다.
- `failures` 배열에는 라벨링 중 오류가 난 게시물 ID와 사유가 포함됩니다.
