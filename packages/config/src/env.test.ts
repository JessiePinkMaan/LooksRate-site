import { describe, expect, it } from "vitest";

import {
  EnvValidationError,
  parseEnv,
  parseOwnerTelegramIds,
  parsePaymentProviders,
} from "./env";

const baseEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "development",
  SITE_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://loxrate:loxrate@localhost:5432/loxrate",
  REDIS_URL: "redis://localhost:6379",
  S3_ENDPOINT: "http://localhost:9000",
  S3_ACCESS_KEY_ID: "loxrate",
  S3_SECRET_ACCESS_KEY: "loxrate-secret",
  S3_BUCKET_VIDEO: "loxrate-video",
  S3_BUCKET_ASSETS: "loxrate-assets",
  SESSION_SECRET: "dev-only-session-secret-change-me-please",
  VIDEO_KEY_MASTER: "dev-only-video-key-master-change-me",
  DEV_LOGIN: "true",
  TELEGRAM_MODE: "fake",
  PAYMENT_PROVIDERS: "fake",
};

describe("parseEnv", () => {
  it("парсит корректное dev-окружение", () => {
    const env = parseEnv({ ...baseEnv });

    expect(env.NODE_ENV).toBe("development");
    expect(env.DEV_LOGIN).toBe(true);
    expect(env.AGE_GATE_MIN).toBe(18);
    expect(env.S3_FORCE_PATH_STYLE).toBe(true);
  });

  it("бросает понятную ошибку при нехватке обязательных полей", () => {
    expect(() => parseEnv({ NODE_ENV: "development" })).toThrow(
      EnvValidationError,
    );
  });

  it("запрещает dev-механизмы в проде (§17, §22)", () => {
    expect(() =>
      parseEnv({ ...baseEnv, NODE_ENV: "production" }),
    ).toThrow(/production/);
  });

  it("требует HTTPS SITE_URL в проде", () => {
    expect(() =>
      parseEnv({
        ...baseEnv,
        NODE_ENV: "production",
        SITE_URL: "http://loxrate.example",
        DEV_LOGIN: "false",
        TELEGRAM_MODE: "live",
        PAYMENT_PROVIDERS: "stars",
      }),
    ).toThrow(/https/);
  });

  it("не пропускает fake-платежи в проде", () => {
    expect(() =>
      parseEnv({
        ...baseEnv,
        NODE_ENV: "production",
        SITE_URL: "https://loxrate.example",
        DEV_LOGIN: "false",
        TELEGRAM_MODE: "live",
        PAYMENT_PROVIDERS: "stars,fake",
      }),
    ).toThrow(/fake/);
  });
});

describe("helpers", () => {
  it("разбирает OWNER_TELEGRAM_IDS", () => {
    expect(parseOwnerTelegramIds("1, 2 ,3")).toEqual(["1", "2", "3"]);
  });

  it("разбирает PAYMENT_PROVIDERS", () => {
    expect(parsePaymentProviders("stars, fake")).toEqual(["stars", "fake"]);
  });
});
