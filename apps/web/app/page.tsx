/**
 * Фаза 0 — минимальный «Порог». Полноценный лендинг и движок переходов —
 * Фазы 1–3. Здесь только рабочая оболочка в нужном вайбе.
 */
export default function HomePage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden bg-void px-6 text-center text-ash">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(201,162,39,0.10),transparent_42%)]"
      />

      <p className="relative font-mono text-[0.7rem] uppercase tracking-[0.55em] text-steel">
        LoxRate
      </p>

      <h1 className="relative max-w-3xl text-balance text-5xl font-semibold leading-[0.92] tracking-tight sm:text-7xl">
        Будь неудобным.
      </h1>

      <p className="relative max-w-md text-pretty text-sm leading-relaxed text-steel">
        Подвал открывается скоро. Пока здесь темно — но дверь уже
        не заперта.
      </p>

      <div aria-hidden className="relative h-px w-24 bg-blood" />

      <p className="relative font-mono text-[0.65rem] uppercase tracking-[0.3em] text-steel/70">
        Ты не фон.
      </p>
    </main>
  );
}
