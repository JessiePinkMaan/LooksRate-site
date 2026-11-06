# Cloudflare Workers - бесплатный публичный хост

Инструкция от нуля до ссылки `https://loxrate.<аккаунт>.workers.dev`.

Что работает: все страницы, регистрация и вход, профиль, ранги, идеи,
комментарии, зал славы, админка.
Что временно отключено: загрузка и просмотр видео (на Workers нет постоянного
диска). Эндпоинты видео возвращают 503, остальной сайт работает.

Стек этого варианта:

- Cloudflare Workers (Next.js через `@opennextjs/cloudflare`);
- PostgreSQL в Neon (free);
- Hyperdrive - пулер Cloudflare к Neon;
- секреты и переменные - в панели Cloudflare.

Сборка и деплой идут из GitHub Actions: на Windows OpenNext падает на
симлинках (`EPERM`), а на Linux-раннере всё собирается штатно.

## Лимиты бесплатного плана

| Ресурс | Free |
|---|---|
| Запросы к Worker | 100 000 в день |
| CPU на запрос | 10 мс |
| Запросы к БД через Hyperdrive | 100 000 в день |
| Размер загружаемого тела запроса | 100 МБ |
| Neon | free-план, лимиты у Neon в панели |

Если в логах появится `Error 1102 (exceeded CPU)`, включи Workers Paid за
$5/мес - это единственный реалистичный платный шаг. Всё остальное остаётся
бесплатным.

---

## Шаг 1. База данных в Neon

1. Зайди на `https://neon.tech` и создай проект (регион ближе к аудитории).
2. Открой **Dashboard → Connection Details**.
3. Выбери свою базу и роль.
4. **Сними галочку Connection pooling** - Hyperdrive сам пулит соединения,
   двойной пулер не нужен.
5. Скопируй строку вида
   `postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`.

Эта строка понадобится дважды: для Hyperdrive и для миграций.

## Шаг 2. Hyperdrive в Cloudflare

1. В панели Cloudflare слева открой **Storage & databases**.
2. Выбери **Hyperdrive** → **Create configuration**.
3. Имя: `loxrate-db`.
4. Вставь строку подключения из Neon.
5. **Отключи кеширование** (Cache / Max age → 0 или Disabled).

Кеш Hyperdrive по умолчанию держит результаты `SELECT` до 60 секунд. Для сайта
с сессиями и XP это опасно: вход и права могут отставать от базы. Кеш нужно
выключить.

6. Создай конфигурацию и скопируй её **ID** (32 символа).

## Шаг 3. Прописать ID в проекте

Открой `apps/web/wrangler.jsonc` и замени заглушку:

```jsonc
"hyperdrive": [
  {
    "binding": "HYPERDRIVE",
    "id": "ВСТАВЬ_ID_ИЗ_ШАГА_2",
    "localConnectionString": "postgresql://loxrate:loxrate@localhost:5432/loxrate?schema=public"
  }
]
```

`localConnectionString` нужен только для локального `wrangler dev`, на деплой
не влияет.

Закоммить изменение:

```bash
git add apps/web/wrangler.jsonc
git commit -m "chore: set Cloudflare Hyperdrive id"
git push
```

ID Hyperdrive не секрет, его можно держать в репозитории.

## Шаг 4. Секреты GitHub

В GitHub открой репозиторий → **Settings → Secrets and variables → Actions**.

**Secrets** (кнопка **New repository secret**):

| Имя | Значение |
|---|---|
| `CLOUDFLARE_API_TOKEN` | токен Cloudflare (см. ниже) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID из панели Cloudflare |
| `DATABASE_URL` | строка Neon **без** `-pooler` (для миграций) |

Токен Cloudflare: аватар → **My Profile → API Tokens → Create Token** →
шаблон **Edit Cloudflare Workers** → Account Resources: твой аккаунт → Create.
Скопируй токен один раз, он больше не показывается.

`CLOUDFLARE_ACCOUNT_ID` виден справа в разделе **Workers & Pages → Account
details** (например, `864574e2...`).

**Variables** (вкладка **Variables** → **New repository variable**):

| Имя | Значение |
|---|---|
| `SITE_URL` | `https://loxrate.<твой-поддомен>.workers.dev` |

Поддомен виден там же, в **Account details → Subdomain**. Имя Worker задано в
`wrangler.jsonc` (`"name": "loxrate"`), поэтому адрес получается
`https://loxrate.<subdomain>.workers.dev`.

> `SITE_URL` попадает в `robots.txt` и `sitemap.xml` на этапе сборки. Если
> позже поменяешь адрес, пересобери Worker.

## Шаг 5. Первый деплой

1. В GitHub открой вкладку **Actions**.
2. Слева выбери **Deploy Cloudflare Workers**.
3. Нажми **Run workflow** → ветка с изменениями → **Run workflow**.
4. Дождись зелёной галочки. Шаги: install → prisma generate → migrate → build →
   deploy.

После первого запуска в Cloudflare появится Worker `loxrate`.

## Шаг 6. Переменные окружения Worker

Открой Cloudflare → **Workers & Pages** → `loxrate` → **Settings** →
**Variables and Secrets** → **Add**.

Добавь (тип **Secret** для секретов, **Text** для остальных):

| Имя | Тип | Значение |
|---|---|---|
| `SITE_URL` | Text | `https://loxrate.<subdomain>.workers.dev` |
| `NODE_ENV` | Text | `production` |
| `DATABASE_URL` | Secret | строка Neon (нужна схеме env; рантайм ходит через Hyperdrive) |
| `SESSION_SECRET` | Secret | случайная строка ≥ 32 символов |
| `VIDEO_KEY_MASTER` | Secret | случайная строка ≥ 32 символов |
| `DEV_LOGIN` | Text | `false` |
| `TELEGRAM_MODE` | Text | `live` |
| `TELEGRAM_FEED_MODE` | Text | `fixture` |
| `PAYMENT_PROVIDERS` | Text | `stars` |
| `REDIS_URL` | Text | `redis://unused:6379` |
| `S3_ENDPOINT` | Text | `https://unused.invalid` |
| `S3_ACCESS_KEY_ID` | Text | `unused` |
| `S3_SECRET_ACCESS_KEY` | Secret | `unused` |
| `S3_BUCKET_VIDEO` | Text | `loxrate-video` |
| `S3_BUCKET_ASSETS` | Text | `loxrate-assets` |

Почему заглушки: схема окружения требует эти переменные, но текущий R1 не
использует Redis и S3. Когда появится облачное видео, сюда придут реальные
значения.

Секреты можно сгенерировать так:

```powershell
# PowerShell: 32 случайных байта в hex
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
-join ($bytes | ForEach-Object { $_.ToString("x2") })
```

или в Linux/macOS:

```bash
openssl rand -hex 32
```

После добавления переменных открой сайт: настройки применяются без
передеплоя.

## Шаг 7. Первый владелец

Регистрация на сайте создаёт роль `USER`, поэтому админка сразу закрыта.

1. Открой `https://loxrate.<subdomain>.workers.dev`, зарегистрируйся.
2. На своей машине выполни (PowerShell):

```powershell
$env:DATABASE_URL="postgresql://...neon.../neondb?sslmode=require"
pnpm --filter @loxrate/db promote <твой_логин>
Remove-Item Env:\DATABASE_URL
```

Команда ставит роль `OWNER` и пишет запись в `audit_log`. Обнови страницу -
появится `/admin`.

## Шаг 8. Проверка

```bash
curl -fsS https://loxrate.<subdomain>.workers.dev/api/health
curl -fsS https://loxrate.<subdomain>.workers.dev/api/health/ready
```

- `/api/health` - приложение живо;
- `/api/health/ready` - доходит до PostgreSQL через Hyperdrive.

В браузере проверь: главная, врата, регистрация, вход, `/me`, `/admin`,
`/dev/login` (должен быть 404).

## Что отключено и почему

- **Видео**: `/api/videos/*` и загрузка в админке отвечают 503. На Workers нет
  постоянного диска; для видео нужен R2 и presigned-загрузка - отдельный этап.
- **Rate limit**: хранится в памяти изолята, поэтому лимит приблизительный.
  Для строгого лимита нужен KV или Durable Object.
- **Redis**: код его пока не использует, переменная нужна только схеме env.

## Если что-то не работает

| Симптом | Причина |
|---|---|
| Все страницы 500, в логах «Невалидное окружение» | не добавлены переменные из шага 6 |
| `Error 1102 (exceeded CPU)` | Free-план, 10 мс CPU; включи Workers Paid ($5) |
| `Error 1027` | закончились 100 000 запросов в день |
| `/wrangler.jsonc` ошибка Hyperdrive ID | заглушка не заменена на ID из шага 2 |
| Вход «не видит» нового пользователя | в Hyperdrive включён кеш; выключи его |
| Сборка на Windows падает с `EPERM: symlink` | собирай через GitHub Actions или WSL |
| `503` на видео | так и задумано, видео временно отключено |

## Обновление сайта

После `git push` в ветку: GitHub → **Actions → Deploy Cloudflare Workers →
Run workflow**. Миграции применяются автоматически перед деплоем.

## Откат

Cloudflare хранит версии Worker: **Workers & Pages → loxrate → Deployments** →
выбери предыдущую версию → **Rollback**. Схема БД назад не откатывается
автоматически - для этого нужен дамп Neon.
