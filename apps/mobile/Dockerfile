FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@latest

# Copy monorepo configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages/core ./packages/core
COPY apps/mobile ./apps/mobile

RUN pnpm config set minimum-release-age 0 && pnpm install --no-frozen-lockfile --dangerously-allow-all-builds

RUN pnpm --filter @checkpoint/core build

WORKDIR /app/apps/mobile

EXPOSE 8081

ENV CI=1
ENV EXPO_NO_TELEMETRY=1

CMD ["npx", "expo", "start", "--web", "--port", "8081"]
