import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Dev-исходящая очередь Telegram-бота (ТЗ §25). Реальная очередь — Фаза 6+.
 */
export default function DevOutboxPage() {
  const enabled =
    process.env.DEV_LOGIN === "true" && process.env.NODE_ENV !== "production";

  if (!enabled) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-steel">
          dev · outbox
        </p>
        <h1 className="text-2xl font-semibold">Исходящие сообщения</h1>
        <p className="text-sm text-steel">
          Заглушка §25 (`TELEGRAM_MODE=fake`). Пока очередь пуста.
        </p>
      </header>

      <p className="border border-graphite bg-concrete px-4 py-3 font-mono text-xs text-steel">
        Здесь пока темно.
      </p>
    </main>
  );
}
