# LoxRate

Сайт-визитка и закрытый клуб вокруг Telegram-проекта LoxRate. Тёмный «подвал»,
золотое яблоко раздора, стоицизм, дарк-люкс и жёсткая дисциплина. Флагман -
вкладка «Основатели»: две фигуры в свете лампы, камера сверху вниз, динамический
свет и цитаты.

Источник истины по продукту - `TZ_LOXRATE_SITE.md`, правила работы -
`AGENTS.md`, принятые решения - `DECISIONS.md`.

## Технологии

- **Next.js 16** (App Router, React Server Components, Server Actions).
- **React 19** + **TypeScript strict**.
- **Tailwind CSS v4** и собственная дизайн-система в `packages/ui`.
- **PostgreSQL 16** + **Prisma 7** (`@prisma/adapter-pg`).
- **Redis 7** - зарезервирован под кеш, капы и очереди.
- **Аутентификация** - логин/пароль, scrypt, серверные сессии в PostgreSQL
  и httpOnly-cookie.
- **Движение** - CSS, GSAP + Lenis там, где нужен скролл-драйв, Web Animations
  API для интро. У всех эффектов есть reduced-motion/effects-off fallback.
- **Ассеты** - Sharp: вырезание чёрного фона, WebP, responsive-наборы.
- **Тесты** - Vitest, Playwright, axe-core.
- **Docker** - Next standalone image, production compose, optional Caddy/MinIO.
- **Telegram** - канал и фид; вход в прод-версии через логин/пароль, не через бота.

## Как это работает

### Вход и врата
Первый визит на главную закрыт вратами: большое яблоко в темноте, цитаты
стоиков и подсказка. При наведении яблоко трескается, по клику открываются
«Регистрация» и «Войти». После успешного входа яблоко дрожит, шапка и пункты
проявляются по очереди, затем яблоко перелетает в hero и уменьшается. Есть
гостевой путь «Осмотреться без аккаунта».

Пароли хранятся как `scrypt$<salt>$<hash>` (`apps/web/lib/password.ts`).
Сессии - в таблице `sessions`, в cookie лежит только случайный токен.
Вход и регистрация имеют rate limit; несуществующий логин обрабатывается за
то же время, что и существующий.

### Профиль
`/me` - сцена с одним силуэтом в свете лампы. Аура, вещь (шляпа/шарф/плащ/цепь)
и фон меняются вживую и сохраняются в `users.profile_theme`. Друзья встают рядом
со своими аурами; есть заявки, принятие, удаление и поиск по логину. Пользователь
может вести стену цитат (`user_quotes`) - карточки, выбранная цитата и лимит 12.

### Видео и доступ
`/vault` показывает опубликованные видео. Доступ решает серверная функция
`decideAccess()`: публично, после входа, по рангу или по тарифу. Файлы сейчас
хранятся локально (`storage/videos`, в Docker - named volume) и отдаются через
`/api/videos/[id]/stream` с Range-запросами. Загрузка в админке стримится на
диск, лимит - 512 МБ.

### XP, ранги и сообщество
XP начисляется только через `awardXp()`: журнал `xp_events`, идемпотентность и
дневные капы. Ранги R0-R7 описаны в `content/ru/ranks.json`. Идеи, голоса,
комментарии, достижения и зал славы используют PostgreSQL; правила доступа и
модерация проверяются на сервере.

### Контент и эффекты
Тексты страниц лежат в `content/ru/*.json`, а не в JSX. Цены, пороги XP и
тарифы приходят из БД/конфига. Внешних CDN нет: шрифты через `@fontsource`,
фактуры и ассеты - локальные SVG/WebP. Глобальный переключатель эффектов и
`prefers-reduced-motion` отключают тяжёлые анимации, оставляя статичный вариант.

### Админка
`/admin` доступна только `OWNER`/`ADMIN`. Там статистика, видео, идеи,
комментарии и пользователи. Каждое действие роли `editor` и выше пишется в
`audit_log`.

### Безопасность
- Секреты только в `.env`, в git и Docker-образ не попадают.
- В production обязательны HTTPS `SITE_URL`, `DEV_LOGIN=false`,
  `TELEGRAM_MODE=live` и платёжный провайдер без `fake`.
- Security headers, HSTS, noindex для служебных страниц, rate limit логина.
- `/api/health` - liveness, `/api/health/ready` - проверка PostgreSQL.

## Структура

```text
apps/web          Next.js: сайт, админка, API
apps/worker       воркер-каркас для будущего транскодинга
packages/config   env-валидация (zod) и общие настройки
packages/db       Prisma schema, клиент, миграции, сиды
packages/ui       дизайн-система: карточки, кнопки, эффекты
packages/assets   генератор ассетов (Sharp, SVG, звуки)
content/ru        тексты и сид-контент
assets            исходники владельца для assets:generate
qa                скриншоты и отчёты проверок
docs              DEPLOY.md, QA_AND_RISKS.md
scripts           бэкапы и служебные скрипты
```

## Локальный запуск

Нужны **Node.js 22+** (рекомендуется 24), **pnpm 12** и Docker Desktop/Engine.
Проверено на Windows и Linux.

### 1. Установка

```bash
pnpm install
```

### 2. Окружение

```bash
cp .env.example .env
# Windows PowerShell:
# Copy-Item .env.example .env
```

Для локального старта значения из примера подходят. `DEV_LOGIN=true` включает
`/dev/login`; в production эта возможность запрещена.

### 3. Инфраструктура

```bash
pnpm docker:up
```

Поднимаются PostgreSQL и Redis. MinIO не обязателен для текущего R1 (видео
хранится локально); при необходимости:

```bash
docker compose --profile storage up -d
```

### 4. База данных

```bash
pnpm db:migrate
pnpm db:seed
```

Сид создаёт демо-персон для `/dev/login`. Полный сброс: `pnpm db:reset`.

### 5. Запуск

```bash
pnpm dev
```

- сайт: `http://localhost:3000`
- dev-вход: `http://localhost:3000/dev/login`
- dev-очередь: `http://localhost:3000/dev/outbox`
- health: `http://localhost:3000/api/health`

`pnpm dev` запускает web и worker. Только web:

```bash
pnpm --filter @loxrate/web dev
```

Если PostgreSQL/Redis уже есть снаружи, поменяй `DATABASE_URL` и `REDIS_URL` в
`.env` и не запускай Docker.

### Ассеты

Готовые WebP уже лежат в `apps/web/public/assets`. Пересобрать их из исходников
в `assets/`:

```bash
pnpm assets:generate
```

## Основные команды

| Команда | Что делает |
|---|---|
| `pnpm dev` | web + worker в dev-режиме |
| `pnpm build` | production-сборка |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | статический анализ, типы, Vitest |
| `pnpm e2e` | Playwright smoke-тесты |
| `pnpm docker:up` / `docker:down` | PostgreSQL + Redis (MinIO - профиль `storage`) |
| `pnpm db:migrate` / `db:seed` / `db:reset` | миграции, сиды, сброс |
| `pnpm db:backup` | pg_dump в `backups/` |
| `pnpm db:promote <username>` | выдать пользователю роль `OWNER` |
| `pnpm cf:build` / `cf:deploy` | сборка и деплой Cloudflare Workers (см. `docs/DEPLOY_CLOUDFLARE.md`) |
| `pnpm assets:generate` | WebP/ассеты из исходников |
| `pnpm qa:shots` | скриншоты страниц |
| `pnpm qa:a11y` | axe-аудит |
| `pnpm qa:perf` | Lighthouse/бюджеты (нужен собранный сервер) |

## Переменные окружения

Полный список и дефолты - `.env.example`. Главное:

- `DATABASE_URL`, `REDIS_URL` - PostgreSQL и Redis.
- `SITE_URL` - публичный URL; в production только `https://`.
- `SESSION_SECRET`, `VIDEO_KEY_MASTER` - случайные строки от 32 символов.
- `DEV_LOGIN` - `true` только локально.
- `STORAGE_DIR` - каталог локальных видео.
- `TELEGRAM_*` - канал/бот; для входа в R1 не используются.
- `PAYMENT_PROVIDERS` - в production без `fake`.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm qa:a11y
```

`qa:shots` и `qa:a11y` сами поднимают dev-сервер, если он не запущен. `qa:perf`
ожидает production-сборку и сервер.

## Production

Пошаговый выкат, TLS, миграции, бэкапы, обновление и откат:

- [`docs/DEPLOY.md`](docs/DEPLOY.md) - универсальный чек-лист для Docker-хоста.
- [`docs/DEPLOY_FREE.md`](docs/DEPLOY_FREE.md) - бесплатная публичная ссылка:
  Oracle Cloud Always Free + DuckDNS или временный туннель с домашнего ПК.
- [`docs/DEPLOY_CLOUDFLARE.md`](docs/DEPLOY_CLOUDFLARE.md) - Cloudflare Workers
  + Neon + Hyperdrive: бесплатный `*.workers.dev`, видео временно отключено.
- шаблон: `.env.production.example`
- `docker compose -f docker-compose.prod.yml ...`
- optional Caddy-профиль: `deploy/Caddyfile`
- первый владелец: `pnpm db:promote <username>` (в Docker - сервис `promote`).

## Ограничения текущего R1

- `apps/worker` - каркас; реального транскодинга и очереди пока нет, поэтому
  worker не входит в production-стек.
- Оплата тарифов не подключена; T0-T4 показываются как «Скоро».
- S3/MinIO подготовлены, но видео R1 пишет в локальный volume.
- В Cloudflare-варианте видео временно отключено: для него нужен R2 и
  presigned-загрузка.
- Rate limit логина in-memory; при горизонтальном масштабировании нужен Redis.
- Sentry-переменная зарезервирована, SDK ещё не подключён.

## Документация

- `TZ_LOXRATE_SITE.md` - продуктовое ТЗ.
- `AGENTS.md` - правила разработки.
- `DECISIONS.md` - решения и отступления.
- `ASSETS_TODO.md` - что ещё нужно от владельца.
- `docs/DEPLOY.md` - деплой.
- `docs/DEPLOY_FREE.md` - бесплатный публичный стенд.
- `docs/DEPLOY_CLOUDFLARE.md` - Cloudflare Workers.
- `docs/QA_AND_RISKS.md` - QA и риски.
- `CHANGELOG.md` - изменения по фазам.
