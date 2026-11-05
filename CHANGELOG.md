# CHANGELOG

Все заметные изменения проекта. Формат — по фазам/релизам ТЗ §19.

## [Unreleased]

### Phase 5 — Выкат R1 — готово к приёмке
- SEO: `sitemap.xml`, `robots.txt`, `icon.svg`, OG 1200×630, JSON-LD,
  openGraph/twitter/canonical.
- a11y: axe-аудит 7 страниц — **0 нарушений**; фиксы контраста (`steel`, `ember`,
  убран `opacity` из scroll-переходов).
- Перф: `/` LCP 144 мс · CLS 0.0116 · JS 210 КБ · transfer 369 КБ; бюджеты в норме.
- Деплой: Dockerfile web/worker, `docker-compose.prod.yml`, `/api/health`,
  migrate/seed tools, `pnpm db:backup`, `docs/DEPLOY.md`.
- Кросс-браузер: Chromium; e2e-smoke 3/3 (главная, статические, health/SEO);
  Firefox/WebKit — по наличию.

### Phase 4 — «Основатели» — готово к приёмке
- Флагманская сцена: пол, базовая лампа + фонарь за курсором, два силуэта (CC0),
  пыль, луч, заголовок «ОСНОВАТЕЛИ».
- Скролл = спуск камеры; T7-опрокидывание на входе; цитаты по одной рядом с силуэтами.
- «Досье» по клику (Esc/фон): роль, зона ответственности, все цитаты, Telegram.
- reduced-motion/без эффектов — статичная сцена, hover-подсветка, sr-only описание.
- CTA «Войти в Подвал» → `/access` (T2), т.к. `/vault` — Фаза 8.

### Phase 3 — Лендинг и статические страницы — готово к приёмке
- Комнаты 00–06 и 08: «Порог» (18+ + hold), Hero, Манифест + Кодекс,
  «Три двери», Лор-превью, коридор рангов, Vault-превью, Footer.
- Статические: `/manifest`, `/ranks`, `/access` («Скоро»), `/lore`,
  `/legal/rules|privacy|terms|18plus`.
- Скролл-переходы film/fold/tunnel/chains/iris; роут-переходы через `TLink`.
- Контент из `content/ru/*.json` (manifest, codex, glossary, ranks, tiers, faq,
  feed, vault-preview, legal).
- Яблоко владельца: обрезка + прозрачный фон (`sharp`) → `apple-photo.webp/png/black`.
- Фикс: занавес больше не висит поверх страниц в покое.
- QA: скриншоты лендинга/страниц, «Порог», hero, reduced-motion.

### Phase 2 — Движок движения — готово к приёмке
- Lenis + GSAP ScrollTrigger (ленивый импорт), отключение при reduced-motion/эффектах.
- `TransitionProvider`: cover → push → ready → scrollTo(0) → reveal, watchdog 4 с,
  fallback-кроссфейд 200 мс.
- Занавес на OGL: шейдеры T1/T2/T3/T6/T9, отдельный чанк, DPR ≤ 1.5.
- `TLink` для внутренних переходов.
- Стенд `/_transitions` (rewrite): 5 роут-переходов + T4/T5/T7/T8 (ScrollTrigger).
- `pnpm qa:shots` расширен: стенд + кадр шейдерного перехода в середине.

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
