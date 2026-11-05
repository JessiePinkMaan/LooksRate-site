# CHANGELOG

Все заметные изменения проекта. Формат — по фазам/релизам ТЗ §19.

## [Unreleased]

### Phase 1 — Дизайн-система — готово к приёмке
- Токены: палитра, типографика (Cormorant Garamond / Oswald / IBM Plex Mono / Inter),
  фактуры, базовая сетка.
- Шрифты self-host через `@fontsource` (кириллица, без внешних CDN).
- Компоненты: `HoldButton`, `RivetedCard`, `BeltDivider`, `CustomCursor`,
  `EffectsToggle`, `SoundToggle`, `EffectsProvider`.
- Глобальные настройки эффектов/звука: `prefers-reduced-motion`, кнопка
  «Отключить эффекты», звук выключен по умолчанию.
- Стенд `/_design` (rewrite → `/design`) + плёночное зерно, виньетка, бетон.
- `docs/QA_AND_RISKS.md` с рубрикой «вайба» (10 × 0–2).
- `pnpm qa:shots` на Playwright: 4 ширины + курсор + reduced-motion в `qa/shots/phase-1/`.

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
