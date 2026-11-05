import type { Metadata } from "next";

import { TLink } from "@/components/motion/TLink";

export const metadata: Metadata = {
  title: "Вход",
};

export default function LoginPage() {
  const devEnabled =
    process.env.DEV_LOGIN === "true" &&
    process.env.NODE_ENV !== "production";

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        /login
      </p>
      <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.95]">
        Вход
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-steel">
        Вход через Telegram появится, когда будет подключён отдельный бот
        (`@loxrate_auth_bot`). Пока доступен dev-вход с тестовым персонажем —
        он создаёт реальную сессию в базе.
      </p>

      <button
        type="button"
        disabled
        className="mt-8 block w-full border border-graphite bg-concrete px-5 py-4 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-steel opacity-60"
      >
        Войти через Telegram — скоро
      </button>

      {devEnabled ? (
        <TLink
          href="/dev/login"
          className="mt-3 block w-full border border-blood bg-blood px-5 py-4 text-center font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:bg-blood-deep"
        >
          Dev-вход
        </TLink>
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-steel">
        18+. Продолжая, ты подтверждаешь, что тебе есть 18. Это игра и
        инструмент, а не диагноз и не приговор.
      </p>
    </main>
  );
}
