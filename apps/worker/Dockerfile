# syntax=docker/dockerfile:1
FROM node:24-alpine
RUN apk add --no-cache libc6-compat openssl ffmpeg
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @loxrate/db generate
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@loxrate/worker", "start"]
