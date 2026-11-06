# Бесплатный публичный деплой (R1)

Задача: получить рабочую ссылку вида `https://loxrate.duckdns.org`, где живёт
весь сайт - PostgreSQL, Redis, загрузка видео и админка, - не платя за хостинг.

Полностью бесплатные PaaS (Vercel, Render, Railway, Fly.io) для этого стека не
подходят: им нужен постоянный диск под видео, а free-тарифы либо стирают файлы,
либо засыпают, либо запрещают коммерческое использование. Поэтому бесплатный
вариант - **своя VM с Docker** на вечно-бесплатном тарифе Oracle Cloud плюс
бесплатный поддомен.

## Что понадобится

- Аккаунт Oracle Cloud (карта для верификации, списаний на Always Free нет).
- Аккаунт DuckDNS (бесплатно, вход через GitHub/Google).
- Репозиторий на GitHub (для приватного - deploy key или PAT).
- 30-40 минут и SSH-клиент.

Итог: 2 OCPU / 12 ГБ RAM (можно 4/24), Ubuntu 24.04 ARM, Docker Compose,
Caddy с автоматическим HTTPS.

---

## Вариант A. Oracle Cloud Always Free (рекомендуется)

### A1. Создать VM

1. Зайди на `cloud.oracle.com`, выбери **Always Free**.
2. Compute → Instances → **Create instance**.
3. Image: **Ubuntu 24.04** (aarch64).
4. Shape: **VM.Standard.A1.Flex**, 2 OCPU / 12 GB. Если пишет «out of
   capacity» - попробуй другое Availability Domain или 1 OCPU / 6 GB.
5. Public IPv4: **Assign a public IPv4 address**.
6. SSH keys: сгенерируй новую пару и скачай приватный ключ.
7. Boot volume: 50-100 ГБ (в бесплатный лимит 200 ГБ входит).
8. Создай инстанс и запиши публичный IP.

### A2. Открыть порты

Сначала в консоли Oracle: VCN → Security List → **Add Ingress Rules**:

| Source | Protocol | Port |
|---|---|---|
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |
| твой IP | TCP | 22 |

Затем на самой VM. В образах Oracle по умолчанию стоит REJECT в iptables,
одного Security List недостаточно:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo apt-get update && sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

Проверка после запуска сайта: `curl -I http://<IP>` должен отвечать, а не
висеть.

### A3. Docker

```bash
sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
# выйди и зайди по SSH снова, чтобы группа применилась
docker compose version
```

### A4. Код

```bash
git clone https://github.com/JessiePinkMaan/LooksRate-site.git loxrate
cd loxrate
git checkout phase/14-immersion   # или main, если ветка уже влита
```

Приватный репозиторий: добавь SSH deploy key в GitHub и клонируй по
`git@github.com:...`, либо используй PAT. Токен не оставляй в истории команд.

### A5. Бесплатный домен

DuckDNS:

1. `duckdns.org` → войди → создай поддомен, например `loxrate`.
2. В поле IP укажи публичный IP VM.
3. Домен будет `loxrate.duckdns.org`.

Если публичный IP может смениться, добавь обновление в cron (токен храни в
отдельном файле с правами `600`, не в git):

```bash
*/5 * * * * curl -fsS "https://www.duckdns.org/update?domains=loxrate&token=<TOKEN>&ip=" >/dev/null
```

Совсем без регистрации: вместо DuckDNS можно взять `IP-через-дефисы.sslip.io`
(например, `130-61-1-2.sslip.io`). Caddy выпустит сертификат и на него, но
такая ссылка выглядит хуже.

### A6. Окружение

```bash
cp .env.production.example .env
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 32   # VIDEO_KEY_MASTER
```

Заполни в `.env`:

```env
SITE_URL=https://loxrate.duckdns.org
SITE_DOMAIN=loxrate.duckdns.org
ACME_EMAIL=твой@email
POSTGRES_PASSWORD=<сильный пароль без спецсимволов>
DATABASE_URL=postgresql://loxrate:<тот же пароль>@postgres:5432/loxrate?schema=public
SESSION_SECRET=<64 hex>
VIDEO_KEY_MASTER=<64 hex>
DEV_LOGIN=false
TELEGRAM_MODE=live
TELEGRAM_FEED_MODE=fixture
PAYMENT_PROVIDERS=stars
```

Важно:

- `SITE_URL` **обязательно** `https://`: production-валидация не пропустит
  `http://`. Он же передаётся build-arg, поэтому смена домена = пересборка.
- Спецсимволы в пароле БД нужно percent-encode внутри `DATABASE_URL`.
- `S3_*` обязательны по схеме env, хотя текущий R1 видео в S3 не пишет.
  Если не включаешь профиль `storage`, оставь значения из шаблона.
- `TELEGRAM_MODE=live` требуется в production, но бот для входа в R1 не нужен.

### A7. Запуск

```bash
docker compose -f docker-compose.prod.yml --profile proxy up -d --build
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

Первая сборка на ARM занимает 5-15 минут. Caddy сам получит сертификат
Let's Encrypt, когда домен уже указывает на VM.

Если сборка падает по памяти (актуально для 1 ГБ инстансов), добавь swap:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### A8. Создать владельца

Сид с демо-персонами для прода не нужен, а регистрация создаёт роль `USER`.
Поэтому:

1. Открой сайт, зарегистрируйся под своим логином.
2. Выдай себе `OWNER`:

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm promote <username>
```

Команда пишет запись в `audit_log`. После неё перезайди на сайт - откроется
`/admin`.

### A9. Проверка

```bash
curl -fsS https://loxrate.duckdns.org/api/health
curl -fsS https://loxrate.duckdns.org/api/health/ready
docker compose -f docker-compose.prod.yml ps
```

В браузере: врата → регистрация/вход → `/me` → `/admin`. Проверь, что
`https://loxrate.duckdns.org/dev/login` отдаёт 404, а сертификат валиден.

### A10. Обслуживание

Бэкап БД (ежедневно в cron):

```bash
COMPOSE_FILE=docker-compose.prod.yml pnpm db:backup
```

Дампы лежат в `backups/` на той же машине, поэтому раз в неделю копируй их
внешне (другой сервер, S3/R2, или хотя бы скачивай к себе).

Обновление:

```bash
git pull
docker compose -f docker-compose.prod.yml --profile proxy up -d --build
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

Логи: `docker compose -f docker-compose.prod.yml logs -f web`.

---

## Вариант B. Временная ссылка с домашнего ПК (5 минут)

Годится, чтобы показать сайт, но не как постоянный хостинг: компьютер должен
быть включён, ссылка меняется после перезапуска туннеля.

1. Поставь Docker Desktop и запусти стек:

   ```bash
   cp .env.production.example .env
   # SITE_URL=https://demo.local (валидный https-URL), остальное как в A6
   docker compose -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
   ```

2. Подними туннель:

   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

   (`cloudflared` ставится одним бинарником с GitHub Releases.)

3. Получишь `https://<random>.trycloudflare.com`. Сайт откроется, но
   `SITE_URL` в метаданных останется `demo.local` - для демо это не критично.
   Для правильных canonical/sitemap впиши URL туннеля в `.env` и пересобери
   web.

---

## Почему не бесплатные PaaS

| Платформа | Почему не подходит |
|---|---|
| Vercel Hobby | Нет постоянного диска: загруженные видео исчезают; Hobby запрещает коммерческие проекты |
| Render Free | Web засыпает, диска нет, бесплатный PostgreSQL удаляется через 30 дней |
| Railway | Только стартовый кредит, дальше платно |
| Fly.io | Бесплатного тарифа для новых аккаунтов нет |

Если позже понадобится serverless-вариант, нужно переводить видео на S3/R2 и
выносить БД на Neon/Supabase - это отдельная задача, а не «просто задеплоить».

---

## Чек-лист «ссылка работает»

- [ ] `https://<домен>` открывается без предупреждений сертификата.
- [ ] Врата, регистрация и вход работают.
- [ ] Владелец повышен до `OWNER`, `/admin` доступен.
- [ ] `/dev/login` и `/dev/outbox` отдают 404.
- [ ] `/api/health` и `/api/health/ready` отвечают 200.
- [ ] Видео загружается в админке и переживает `docker compose restart web`.
- [ ] В `backups/` появился дамп, и он восстанавливается на тестовой базе.
- [ ] `docker compose ... ps` показывает `healthy` у postgres, redis, web.

## Ограничения бесплатного варианта

- Нет SLA и резервирования: одна VM, один регион.
- Oracle может потребовать верификацию и иногда «нет capacity» на ARM -
  помогает смена Availability Domain или повторная попытка.
- Бэкапы и мониторинг - на тебе; managed-сервисов в комплекте нет.
- При росте трафика или видео переезжай на платный VPS (Hetzner, Timeweb и
  т.п.) - `docker-compose.prod.yml` переносится без изменений.
