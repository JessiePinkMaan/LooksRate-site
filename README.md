# LoxRate

**Сайт:** https://loxrate.izicou07.workers.dev

Сайт-визитка и закрытый клуб вокруг Telegram-проекта LoxRate. Тёмный «подвал»,
золотое яблоко раздора, стоицизм, дарк-люкс и жёсткая дисциплина. Флагман —
вкладка «Основатели»: две фигуры в свете лампы, камера сверху вниз, динамический
свет и цитаты.

Публичный стенд собран на Cloudflare Workers: там работают все страницы, вход,
профиль, идеи, комментарии, зал славы и админка. Видео на этом стенде временно
отключено — для него нужен объектный storage (R2), это следующий этап. Локально
и в Docker видео работает.


## Стек

**Приложение**

- Next.js 16 (App Router, React Server Components, Server Actions, Turbopack).
- React 19 + TypeScript strict.
- Tailwind CSS v4 и собственная дизайн-система в `packages/ui`.
- Prisma 7 + `@prisma/adapter-pg`; PostgreSQL 16.
- Аутентификация: логин/пароль, scrypt, серверные сессии в PostgreSQL,
  httpOnly-cookie. Без внешних auth-сервисов.
- Движение: CSS, GSAP + Lenis для скролл-сценариев, Web Animations API для
  интро. У каждого эффекта есть CSS/reduced-motion fallback и глобальный
  переключатель «Отключить эффекты».
- Ассеты: Sharp — вырезание чёрного фона, WebP, responsive-наборы. Шрифты
  локальные через `@fontsource`, без CDN.
- Тесты: Vitest, Playwright, axe-core.

**Инфраструктура**

- Cloudflare Workers + OpenNext — публичный стенд.
- Neon PostgreSQL + Cloudflare Hyperdrive — база для Workers.
- GitHub Actions — сборка и деплой Worker по кнопке.
- Docker Compose — локальный и «полный» вариант: PostgreSQL, Redis, Caddy,
  опционально MinIO.
- Redis 7 зарезервирован под кеш, капы и очереди (текущий R1 его не использует).
- Telegram — канал и фид; вход в R1 через логин/пароль, не через бота.

## Как это работает

### Вход и врата

Первый визит на главную закрыт вратами: большое яблоко в темноте, цитаты
стоиков и подсказка. При наведении яблоко трескается, по клику открываются
«Регистрация» и «Войти». После успешного входа яблоко дрожит, шапка и пункты
проявляются по очереди, затем яблоко перелетает в hero и уменьшается. Есть
гостевой путь «Осмотреться без аккаунта».

Пароли хранятся как `scrypt$<salt>$<hash>` (`apps/web/lib/password.ts`).
Сессии — в таблице `sessions`, в cookie лежит только случайный токен.
Вход и регистрация имеют rate limit; несуществующий логин обрабатывается за
то же время, что и существующий.

### Профиль

`/me` — сцена с одним силуэтом в свете лампы. Аура, вещь (шляпа/шарф/плащ/цепь)
и фон меняются вживую и сохраняются в `users.profile_theme`. Друзья встают рядом
со своими аурами; есть заявки, принятие, удаление и поиск по логину. Пользователь
может вести стену цитат (`user_quotes`) — карточки, выбранная цитата и лимит 12.

### Видео и доступ

`/vault` показывает опубликованные видео. Доступ решает серверная функция
`decideAccess()`: публично, после входа, по рангу или по тарифу. В Docker-варианте
файлы лежат локально (`storage/videos`, named volume) и отдаются через
`/api/videos/[id]/stream` с Range-запросами; загрузка в админке стримится на
диск, лимит — 512 МБ.

На Cloudflare Workers постоянного диска нет, поэтому загрузка и стриминг видео
возвращают 503. Планируемое решение — Cloudflare R2 и presigned-загрузка.

### XP, ранги и сообщество

XP начисляется только через `awardXp()`: журнал `xp_events`, идемпотентность и
дневные капы. Ранги R0-R7 описаны в `content/ru/ranks.json`. Идеи, голоса,
комментарии, достижения и зал славы используют PostgreSQL; правила доступа и
модерация проверяются на сервере.

### Контент и эффекты

Тексты страниц лежат в `content/ru/*.json`, а не в JSX. Цены, пороги XP и
тарифы приходят из БД/конфига. Внешних CDN нет: шрифты через `@fontsource`,
фактуры и ассеты — локальные SVG/WebP. Глобальный переключатель эффектов и
`prefers-reduced-motion` отключают тяжёлые анимации, оставляя статичный вариант.

### Админка

`/admin` доступна только `OWNER`/`ADMIN`. Там статистика, видео, идеи,
комментарии и пользователи. Каждое действие роли `editor` и выше пишется в
`audit_log`. В production нет готовых админских логинов: владелец регистрируется
сам, после чего ему выдаётся роль `OWNER` командой `pnpm db:promote`.

## Структура

```text
apps/web          Next.js: сайт, админка, API
apps/worker       воркер-каркас для будущего транскодинга
packages/config   env-валидация (zod) и общие настройки
packages/db       Prisma schema, клиент, миграции, сиды, promote
packages/ui       дизайн-система: карточки, кнопки, эффекты
packages/assets   генератор ассетов (Sharp, SVG, звуки)
content/ru        тексты и сид-контент
assets            исходники владельца для assets:generate
qa                скриншоты и отчёты проверок
docs              деплой, QA и риски
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

Секреты не коммитятся: `.env`, `cloudflare.env` и `.env.*.local` уже в
`.gitignore`.

### 3. Инфраструктура

```bash
pnpm docker:up
```

Поднимаются PostgreSQL и Redis. MinIO для текущего R1 не обязателен (видео
хранится локально); при необходимости:

```bash
docker compose --profile storage up -d
```

### 4. База данных

```bash
pnpm db:migrate
pnpm db:seed
```

Сид создаёт демо-персон для `/dev/login` и примеры контента. Полный сброс:
`pnpm db:reset`.

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
| `pnpm docker:up` / `docker:down` | PostgreSQL + Redis (MinIO — профиль `storage`) |
| `pnpm db:migrate` / `db:seed` / `db:reset` | миграции, сиды, сброс |
| `pnpm db:backup` | pg_dump в `backups/` |
| `pnpm db:promote <username>` | выдать пользователю роль `OWNER` |
| `pnpm cf:build` / `cf:deploy` | сборка и деплой Cloudflare Workers |
| `pnpm assets:generate` | WebP/ассеты из исходников |
| `pnpm qa:shots` | скриншоты страниц |
| `pnpm qa:a11y` | axe-аудит |
| `pnpm qa:perf` | Lighthouse/бюджеты (нужен собранный сервер) |

## Переменные окружения

Полный список и дефолты — `.env.example`. Главное:

- `DATABASE_URL`, `REDIS_URL` — PostgreSQL и Redis.
- `SITE_URL` — публичный URL; в production только `https://`.
- `SESSION_SECRET`, `VIDEO_KEY_MASTER` — случайные строки от 32 символов.
- `DEV_LOGIN` — `true` только локально.
- `STORAGE_DIR` — каталог локальных видео.
- `TELEGRAM_*` — канал/бот; для входа в R1 не используются.
- `PAYMENT_PROVIDERS` — в production без `fake`.

Для Cloudflare Workers переменные задаются в панели Cloudflare (или через
`wrangler secret bulk`), а `CF_WORKERS=true` приходит из `wrangler.jsonc`.

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

**Основной стенд — Cloudflare Workers:**

- [`docs/DEPLOY_CLOUDFLARE.md`](docs/DEPLOY_CLOUDFLARE.md) — Neon + Hyperdrive +
  GitHub Actions, бесплатный `*.workers.dev`.
- Сборка: `pnpm cf:build`, деплой: `pnpm cf:deploy` или workflow
  **Deploy Cloudflare Workers** в GitHub Actions.
- Миграции запускаются локально: `prisma migrate deploy` с прямой строкой Neon.

**Полный вариант в Docker** (с видео):

- [`docs/DEPLOY.md`](docs/DEPLOY.md) — универсальный чек-лист для Docker-хоста.
- [`docs/DEPLOY_FREE.md`](docs/DEPLOY_FREE.md) — бесплатная VM (Oracle Always
  Free) + DuckDNS или временный туннель.
- Шаблон окружения: `.env.production.example`.
- `docker compose -f docker-compose.prod.yml ...`
- Optional Caddy-профиль: `deploy/Caddyfile`.
- Первый владелец: `pnpm db:promote <username>` (в Docker — сервис `promote`).

## Приватность и безопасность

- В репозитории нет реальных секретов: пароли БД, токены, `SESSION_SECRET` и
  `VIDEO_KEY_MASTER` живут только в локальном `.env` / `cloudflare.env` или в
  секретах GitHub/Cloudflare. Эти файлы в `.gitignore`.
- Публичный стенд не содержит демо-пользователей и тестовых паролей. Владелец
  создаёт аккаунт сам, роль выдаётся вручную.
- Пароли хешируются scrypt, в cookie — только случайный токен сессии.
- Rate limit на вход/регистрацию; ответ для несуществующего логина не отличается
  по времени.
- Security headers, HSTS, noindex для `/admin`, `/dev`, `/me`, `/login` и других
  служебных страниц.
- `/api/health` — liveness, `/api/health/ready` — проверка PostgreSQL.
- В production обязательны HTTPS `SITE_URL`, `DEV_LOGIN=false`,
  `TELEGRAM_MODE=live` и платёжный провайдер без `fake`; иначе приложение не
  стартует.
- Фото реальных людей не принимаются; лица основателей — только с согласия.
  Пользовательские фото в R1 не загружаются.

## Ограничения текущего R1

- `apps/worker` — каркас; реального транскодинга и очереди пока нет, поэтому
  worker не входит в production-стек.
- Оплата тарифов не подключена; T0-T4 показываются как «Скоро».
- На Cloudflare Workers видео временно отключено: нужен R2 и presigned-загрузка.
- Rate limit логина in-memory; при горизонтальном масштабировании нужен Redis.
- Free-план Workers ограничен 10 мс CPU на запрос; при упоре в лимит включается
  Workers Paid.
- Sentry-переменная зарезервирована, SDK ещё не подключён.

## Документация

- `TZ_LOXRATE_SITE.md` — продуктовое ТЗ.
- `AGENTS.md` — правила разработки.
- `DECISIONS.md` — решения и отступления.
- `ASSETS_TODO.md` — что ещё нужно от владельца.
- `docs/DEPLOY.md` — Docker-деплой.
- `docs/DEPLOY_FREE.md` — бесплатный публичный стенд на VM.
- `docs/DEPLOY_CLOUDFLARE.md` — Cloudflare Workers.
- `docs/QA_AND_RISKS.md` — QA и риски.
- `CHANGELOG.md` — изменения по фазам.
