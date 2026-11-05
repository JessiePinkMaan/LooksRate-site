# CHANGELOG

Все заметные изменения проекта. Формат — по фазам/релизам ТЗ §19.

## [Unreleased]

### Phase 0 — Основа, заглушки, сиды — готово к приёмке
- Каркас монорепы: pnpm workspaces + Turborepo, `apps/{web,worker}`,
  `packages/{config,db,ui,assets}`.
- Корневые команды §25.2: `dev/build/lint/typecheck/test/e2e`,
  `docker:up|down`, `db:migrate|seed|reset`, `assets:generate`, `qa:*`.
- `docker-compose.yml`: PostgreSQL 16, Redis 7, MinIO (+ auto-bucket init).
- `.env.example` + zod-валидация окружения при старте.
- Prisma-схема БД (§15.2) + сид тестовых персонажей (§25.1).
- Сид-контент `content/ru/*.json` (манифест, кодекс, глоссарий, ранги,
  тарифы, квесты, достижения, микрокопия, FAQ, основатели, telegram-фид).
- Генератор процедурных ассетов (`pnpm assets:generate`).
- CI (GitHub Actions): lint, typecheck, test, build.
- `DECISIONS.md`, `ASSETS_TODO.md`, `CHANGELOG.md`, `CLAUDE.md`.
