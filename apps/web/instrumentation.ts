/**
 * Валидация окружения при старте сервера (ТЗ §20, §22).
 * Во время сборки пропускается, чтобы `next build` не требовал .env.
 * В production невалидное окружение останавливает приложение.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { parseEnv } = await import("@loxrate/config/env");

  try {
    parseEnv();
  } catch (error) {
    console.error("[env] Некорректное окружение:", error);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}
