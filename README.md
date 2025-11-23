# Threads Insight Monorepo

This is a monorepo containing the backend and frontend for the Threads Insight project.

## Structure
-   `apps/backend`: Node.js + Express + Prisma Server
-   `apps/frontend`: Next.js 14 Dashboard

## Getting Started

### 1. Install Dependencies
Run this from the root directory to install dependencies for all apps:
```bash
npm install
```

### 2. Run Development Server
Start both the backend and frontend simultaneously:
```bash
npm run dev
```
-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend**: [http://localhost:3001](http://localhost:3001) (Note: Backend port might need adjustment if they conflict, check `docker-compose.yml` or `.env`)

### 3. Build for Production
```bash
npm run build
```

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
