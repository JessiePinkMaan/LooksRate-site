# LoxRate

Сайт-визитка и закрытый клуб вокруг Telegram-проекта LoxRate. Тёмный «подвал»,
золотое яблоко раздора, стоицизм, дарк-люкс. Флагман — вкладка «Основатели».

- Источник истины: `TZ_LOXRATE_SITE.md`
- Правила работы: `AGENTS.md`
- Решения/отступления: `DECISIONS.md`
- Что нужно от владельца: `ASSETS_TODO.md`

## Стек

Node ≥22 · pnpm workspaces + Turborepo · Next.js (App Router) + React +
TypeScript strict · Tailwind v4 · PostgreSQL 16 + Prisma · Redis 7 · MinIO (S3).

## Структура

```
apps/web        Next.js (публичный сайт + админка)
apps/worker     воркер (ffmpeg/очереди; каркас)
packages/config общие tsconfig/eslint + валидация env (zod)
packages/db     Prisma-схема, клиент, сиды
packages/ui     дизайн-система (каркас)
packages/assets генератор процедурных ассетов
content/ru      тексты и сид-контент
qa              скриншоты и отчёты
docs            документация (создаётся по мере фаз)
```

## Быстрый старт

```bash
pnpm install
cp .env.example .env        # Windows: Copy-Item .env.example .env
pnpm docker:up              # postgres, redis, minio
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Команды

| Команда | Что делает |
|---|---|
| `pnpm dev` | web + worker |
| `pnpm build` / `lint` / `typecheck` / `test` | статика, тесты, сборка |
| `pnpm e2e` | Playwright |
| `pnpm docker:up` / `docker:down` | postgres, redis, minio |
| `pnpm db:migrate` / `db:seed` / `db:reset` | миграции, сиды, сброс |
| `pnpm db:backup` | дамп PostgreSQL (`COMPOSE_FILE` для prod) |
| `pnpm assets:generate` | процедурные SVG-заглушки |
| `pnpm qa:shots` / `qa:a11y` / `qa:perf` | скриншоты, axe, Lighthouse |

## Деплой

Production-сборка, Docker, миграции, TLS, бэкапы и чек-лист:
[`docs/DEPLOY.md`](docs/DEPLOY.md). Шаблон окружения: `.env.production.example`.

## Статус

Фаза 0 — основа, заглушки, сиды. Дальше — по фазам ТЗ §19.
