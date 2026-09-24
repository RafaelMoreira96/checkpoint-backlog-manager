# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@latest

# Copy monorepo configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages/core ./packages/core
COPY apps/web ./apps/web

RUN pnpm config set minimum-release-age 0 && pnpm install --no-frozen-lockfile --dangerously-allow-all-builds

RUN pnpm --filter @checkpoint/core build
RUN pnpm --filter @checkpoint/web build

# Serve stage
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
