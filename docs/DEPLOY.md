# DEPLOY — выкат R1

## 1. Подготовка окружения

Скопируй `.env.example` → `.env` на сервере. Для Docker-сети используй **имена
сервисов**, а не `localhost`:

```env
DATABASE_URL=postgresql://loxrate:<password>@postgres:5432/loxrate?schema=public
REDIS_URL=redis://redis:6379
S3_ENDPOINT=http://minio:9000
```

Обязательно для продакшена:

- `NODE_ENV=production`
- `DEV_LOGIN=false`
- `TELEGRAM_MODE=live`
- `PAYMENT_PROVIDERS=stars` (без `fake`)
- `SESSION_SECRET` ≥ 32 символов
- `VIDEO_KEY_MASTER` ≥ 32 символов
- `OWNER_TELEGRAM_IDS=<id владельца>`
- `SITE_URL=https://<домен>`

Секреты не коммитить; `.env` уже в `.gitignore`.

## 2. Сборка и запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка:

```bash
curl -fsS http://localhost:3000/api/health
docker compose -f docker-compose.prod.yml ps
```

## 3. Миграции и сид

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
# только для первого запуска/дева:
# docker compose -f docker-compose.prod.yml --profile tools run --rm seed
```

## 4. TLS и прокси

Поставь Caddy/nginx перед `web:3000`, включи HTTPS/HSTS. Telegram Login требует
HTTPS-домен, привязанный командой `/setdomain` в BotFather.

## 5. Бэкапы

```bash
pnpm db:backup
```

Рекомендуется cron/таймер + выгрузка дампа во внешнее хранилище (S3/R2).
Восстановление:

```bash
docker compose exec -T postgres pg_restore -U loxrate -d loxrate --clean < backups/<file>.dump
```

## 6. Логи и мониторинг

- `docker compose -f docker-compose.prod.yml logs -f web worker`
- Health: `GET /api/health`
- `SENTRY_DSN` в `.env` (опционально)
- Аптайм-чек на `/api/health`

## 7. Обновление

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

Миграции forward-only: откат кода не откатывает схему. Перед рискованными
миграциями — бэкап.

## 8. Откат

- Код: вернуть предыдущий коммит/образ и пересобрать.
- БД: восстановить из бэкапа (п. 5).

## 9. Ограничения

- MinIO-образ может быть недоступен в отдельных окружениях (см. DECISIONS D-10).
  При использовании внешнего S3/R2 убери сервис `minio` из compose и задай `S3_*`.
- Фактический деплой требует домена/учётных данных владельца — по ТЗ §26.2 это
  точка остановки и вопроса владельцу.
