# syntax=docker/dockerfile:1

# --- Builder ---
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @loxrate/db generate
RUN pnpm --filter @loxrate/web build

# --- Runner (Next standalone) ---
FROM node:24-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
