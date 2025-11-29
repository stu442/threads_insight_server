FROM node:20-slim AS builder
WORKDIR /app

# Copy root configuration
COPY package.json package-lock.json turbo.json ./

# Copy package.json of all apps to satisfy workspace requirements for npm ci
# We use a wildcard to copy if possible, but COPY doesn't support wildcards for directories easily in this way without flattening.
# So we copy explicitly.

COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend-nest/package.json ./apps/backend-nest/

# Install dependencies (using root lockfile)
RUN npm install

# Copy the backend-nest app source
COPY apps/backend-nest ./apps/backend-nest

# Generate Prisma client
WORKDIR /app/apps/backend-nest
RUN npx prisma generate

# Build the app
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy node_modules from builder (root level)
COPY --from=builder /app/node_modules ./node_modules

# Copy built app artifacts
COPY --from=builder /app/apps/backend-nest/dist ./dist
COPY --from=builder /app/apps/backend-nest/prisma ./prisma
COPY --from=builder /app/apps/backend-nest/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/main.js"]
