import { z } from "zod";

/**
 * Проверка окружения на старте приложения (ТЗ §20, §22).
 * Приложение не должно запускаться с неполным или опасным окружением.
 */

const boolFromEnv = z
  .enum(["true", "false", "1", "0"])
  .default("false")
  .transform((value) => value === "true" || value === "1");

const urlString = z.string().refine((value) => {
  try {
    return new URL(value).toString().length > 0;
  } catch {
    return false;
  }
}, "Ожидается корректный URL");

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: urlString,
  APP_TIMEZONE: z.string().min(1).default("Europe/Moscow"),
  AGE_GATE_MIN: z.coerce.number().int().min(0).default(18),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  S3_ENDPOINT: urlString,
  S3_REGION: z.string().min(1).default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET_VIDEO: z.string().min(1),
  S3_BUCKET_ASSETS: z.string().min(1),
  S3_FORCE_PATH_STYLE: z
    .enum(["true", "false", "1", "0"])
    .default("true")
    .transform((value) => value === "true" || value === "1"),

  TELEGRAM_BOT_TOKEN: z.string().default(""),
  TELEGRAM_BOT_USERNAME: z.string().min(1).default("loxrate_auth_bot"),
  TELEGRAM_MODE: z.enum(["live", "fake"]).default("fake"),
  TELEGRAM_FEED_MODE: z.enum(["live", "fixture"]).default("fixture"),
  OWNER_TELEGRAM_IDS: z.string().default(""),

  SESSION_SECRET: z.string().min(32),
  DEV_LOGIN: boolFromEnv,

  VIDEO_PROVIDER: z.enum(["local", "mux", "cloudflare"]).default("local"),
  VIDEO_KEY_MASTER: z.string().min(32),

  PAYMENT_PROVIDERS: z.string().default("fake"),

  SENTRY_DSN: z.string().default(""),
});

export type Env = z.infer<typeof envSchema>;

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

function assertSafeForProduction(env: Env): void {
  if (env.NODE_ENV !== "production") return;

  if (env.DEV_LOGIN) {
    throw new EnvValidationError("DEV_LOGIN=true запрещён при NODE_ENV=production.");
  }
  if (env.TELEGRAM_MODE === "fake") {
    throw new EnvValidationError("TELEGRAM_MODE=fake запрещён при NODE_ENV=production.");
  }
  const providers = env.PAYMENT_PROVIDERS.split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);
  if (providers.includes("fake")) {
    throw new EnvValidationError("Провайдер 'fake' запрещён при NODE_ENV=production.");
  }
}

/** Разбирает окружение или бросает понятную ошибку со списком проблем. */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new EnvValidationError(`Невалидное окружение:\n${issues}`);
  }

  const env = result.data;
  assertSafeForProduction(env);
  return env;
}

/** `OWNER_TELEGRAM_IDS` — список id через запятую. */
export function parseOwnerTelegramIds(raw: string): string[] {
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** `PAYMENT_PROVIDERS` — список включённых провайдеров через запятую. */
export function parsePaymentProviders(raw: string): string[] {
  return raw
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);
}
