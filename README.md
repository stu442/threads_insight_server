# Threads Insights API

Threads API Insights Collection 프로젝트입니다. Threads 게시물의 인사이트 데이터를 수집하고 조회할 수 있는 API를 제공합니다.

## 기술 스택

- **Node.js** + **TypeScript**
- **Express**: 웹 프레임워크
- **Prisma**: ORM
- **PostgreSQL**: 데이터베이스
- **Winston**: 로깅
- **Swagger**: API 문서화

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/threads_db"
THREADS_ACCESS_TOKEN=your_threads_access_token
THREADS_USER_ID=your_threads_user_id
PORT=3000
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## API 엔드포인트

### POST /collect

Threads 게시물과 인사이트를 수집합니다.

**Query Parameters:**
- `limit` (optional, number): 수집할 게시물 개수 (기본값: 10)

**Request Body (alternative):**
```json
{
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collected insights for 5 posts"
}
```

### GET /insights

저장된 게시물과 최신 인사이트를 조회합니다.

**Response:**
```json
[
  {
    "id": "19284756301928374",
    "caption": "Sample post content here",
    "permalink": "https://www.threads.net/@user/post/AbCdEfGhIjK",
    "mediaType": "TEXT_POST",
    "username": "sample_user",
    "timestamp": "2025-01-15T14:30:00.000Z",
    "insights": [
      {
        "views": 1234,
        "likes": 56,
        "replies": 12,
        "reposts": 8,
        "quotes": 3
      }
    ]
  }
]
```

## API 문서

서버 실행 후 Swagger UI를 통해 API를 테스트할 수 있습니다:

📚 **http://localhost:3000/api-docs**

## 데이터베이스 스키마

### Post
- `id`: 게시물 ID
- `caption`: 게시물 내용
- `permalink`: 게시물 링크
- `mediaType`: 미디어 타입
- `username`: 사용자명
- `timestamp`: 게시 시간

### Insight
- `postId`: 게시물 ID (외래키)
- `views`: 조회수
- `likes`: 좋아요 수
- `replies`: 댓글 수
- `reposts`: 리포스트 수
- `quotes`: 인용 수
- `timestamp`: 수집 시간

## 프로젝트 구조

```
src/
├── config/         # 설정 파일
│   └── swagger.ts  # Swagger 설정
├── controllers/    # 컨트롤러
│   └── insightController.ts
├── services/       # 외부 API 서비스
│   └── threads.ts
├── types/          # TypeScript 타입 정의
│   └── insight.ts
├── utils/          # 유틸리티
│   └── logger.ts
└── server.ts       # 메인 서버 파일
```

## 라이선스

MIT
