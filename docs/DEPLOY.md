# DEPLOY - выкат R1

Короткий чек-лист для одного Docker-хоста. Все секреты живут только в `.env`
на сервере; `.env` и `backups/` в git не попадают.

Нужен бесплатный публичный стенд (Oracle Always Free + DuckDNS)? Пошагово:
[`DEPLOY_FREE.md`](DEPLOY_FREE.md). Хочешь без сервера, на Cloudflare Workers
(видео при этом отключено)? [`DEPLOY_CLOUDFLARE.md`](DEPLOY_CLOUDFLARE.md).
Ниже - универсальный чек-лист для любого Docker-хоста.

## 0. Что нужно

- VPS/сервер с Docker Engine и Docker Compose v2.
- Домен, A/AAAA-запись на сервер, открытые порты 80 и 443.
- Файл `.env` на основе `.env.production.example`.
- Свободное место под образы, PostgreSQL и локальное видео.

## 1. Окружение

```bash
cp .env.production.example .env
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 32   # VIDEO_KEY_MASTER
```

Заполни в `.env`:

- `SITE_URL=https://<домен>` - **обязательно https**; используется в метаданных,
  robots и sitemap. Это ещё и build-arg, поэтому смена домена требует пересборки.
- `POSTGRES_PASSWORD` и такой же пароль внутри `DATABASE_URL` (спецсимволы
  в URL нужно percent-encode).
- `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` - для MinIO.
- `SITE_DOMAIN` и `ACME_EMAIL`, если включаешь Caddy-профиль.
- `DEV_LOGIN=false`, `TELEGRAM_MODE=live`, `PAYMENT_PROVIDERS=stars`.
- `SESSION_SECRET` и `VIDEO_KEY_MASTER` - минимум 32 символа, уникальные.

Приложение само откажется стартовать при опасном production-окружении
(`DEV_LOGIN=true`, `TELEGRAM_MODE=fake`, `PAYMENT_PROVIDERS=fake`,
`SITE_URL` без `https://`).

Для Docker-сети используй имена сервисов:

```env
DATABASE_URL=postgresql://loxrate:<password>@postgres:5432/loxrate?schema=public
REDIS_URL=redis://redis:6379
S3_ENDPOINT=http://minio:9000
```

## 2. Сборка и запуск

Вариант с Caddy (TLS и HTTPS автоматически):

```bash
docker compose -f docker-compose.prod.yml --profile proxy up -d --build
```

Вариант со своим nginx/внешним прокси:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

По умолчанию `web` слушает только `127.0.0.1:3000` (`WEB_BIND`/`WEB_PORT`),
чтобы приложение не торчало в интернет напрямую. Прокси должен смотреть на
`http://127.0.0.1:3000` или на `web:3000` внутри compose-сети и передавать
`X-Forwarded-For` (Caddy делает это сам) - от него зависит rate limit логина.

## 3. Миграции

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

Сид нужен только для первого запуска/демо-данных:

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm seed
```

Схема обновляется только вперёд. Перед рискованной миграцией сделай бэкап.

Первый владелец: зарегистрируйся на сайте, затем выдай себе роль `OWNER`:

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm promote <username>
```

## 4. Проверка

```bash
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS http://127.0.0.1:3000/api/health/ready
docker compose -f docker-compose.prod.yml ps
```

- `/api/health` - liveness, не зависит от БД.
- `/api/health/ready` - readiness, проверяет `SELECT 1` в PostgreSQL и отдаёт
  503, если база недоступна.
- Docker healthcheck использует liveness, чтобы контейнер не перезапускался
  из-за кратковременной недоступности БД.

## 5. Видео и storage

Сейчас `VIDEO_PROVIDER=local`; файлы лежат в named volume `videostorage`
(`/app/storage`). Без этого volume загруженные видео исчезают при пересоздании
контейнера.

MinIO и S3-переменные оставлены на будущее; текущая загрузка видео в S3 не
ходит. MinIO вынесен в профиль `storage`, чтобы не тянуть лишний контейнер:

```bash
docker compose -f docker-compose.prod.yml --profile storage up -d
```

Если образ MinIO недоступен в вашем registry, используйте внешний S3/R2:
заполните `S3_*` в `.env`, профиль `storage` не включайте. Бакеты внутри
MinIO создаёт `minio-init` идемпотентно.

## 6. Бэкапы

```bash
COMPOSE_FILE=docker-compose.prod.yml pnpm db:backup
```

Для cron (пример):

```cron
15 3 * * * cd /srv/loxrate && COMPOSE_FILE=docker-compose.prod.yml pnpm db:backup
```

Восстановление:

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U loxrate -d loxrate --clean < backups/<file>.dump
```

Раз в месяц проверяй восстановление на отдельной базе. Бэкапы лучше копировать
во внешнее хранилище (S3/R2/другой сервер), а не держать только на том же диске.

## 7. Логи и мониторинг

```bash
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs --tail=200 postgres
```

- json-file ограничен 10 МБ × 3 файла на сервис.
- Внешний аптайм-чек: `/api/health` (liveness) и `/api/health/ready` (readiness).
- `SENTRY_DSN` пока только зарезервирован; для полноценного трейсинга нужен
  SDK-адаптер, отдельная задача.

## 8. Обновление и откат

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

Откат кода: вернуть предыдущий коммит/образ и пересобрать.
Откат схемы: восстановить дамп. Код и схема не откатываются автоматически.

## 9. Безопасность перед публикацией

- [ ] `SITE_URL` с https, домен указывает на сервер.
- [ ] Владелец зарегистрирован и повышен до `OWNER` (`--profile tools run --rm promote`).
- [ ] `DEV_LOGIN=false`, `/dev/*` и `/admin/*` отдают 404/редирект для гостей.
- [ ] `SESSION_SECRET` и `VIDEO_KEY_MASTER` сгенерированы, не из примеров.
- [ ] Пароль PostgreSQL не `loxrate`/`postgres`.
- [ ] Секреты не попали в git, образ и логи.
- [ ] Порты PostgreSQL, Redis и MinIO не открыты наружу.
- [ ] Caddy/nginx включает HTTPS, HSTS и проксирует на `web:3000`.
- [ ] `/api/health/ready` отвечает 200, `docker compose ps` - healthy.
- [ ] Сделан и проверен бэкап БД.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` зелёные.

## 10. Ограничения текущего R1

- `worker` намеренно не входит в prod-стек: это заглушка, которая сразу
  завершается. Вернуть сервис после реального транскодинга.
- Оплата тарифов пока не подключена; T0-T4 показываются как «Скоро».
- Telegram-вход в проде не используется: вход по логину/паролю. Telegram
  остаётся для канала/фида.
- S3/MinIO подготовлены, но текущие видео пишутся в локальный volume. Профиль
  `storage` включайте только при необходимости.
- Rate limit логина/регистрации хранится в памяти процесса. Для одного
  контейнера этого достаточно; при горизонтальном масштабировании вынесите
  его в Redis.

## 11. Точка остановки

Фактический деплой требует домена, DNS и учётных данных владельца. По ТЗ §26.2
это точка вопроса владельцу, а не действие агента.
