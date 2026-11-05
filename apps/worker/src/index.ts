/**
 * Worker-каркас. Фаза 0: валидация окружения и запуск-заглушка.
 * Фаза 8: очередь BullMQ + ffmpeg → HLS (AES-128), постеры, тизеры.
 */
import { parseEnv } from "@loxrate/config/env";

async function main(): Promise<void> {
  const env = parseEnv();
  console.log(
    `[worker] запущен. timezone=${env.APP_TIMEZONE} videoProvider=${env.VIDEO_PROVIDER}`,
  );
  console.log("[worker] Очередь транскода появится в Фазе 8.");
}

main().catch((error: unknown) => {
  console.error("[worker] фатальная ошибка:", error);
  process.exitCode = 1;
});
