import { notFound } from "next/navigation";

import { devLoginAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DevLoginPage() {
  const enabled =
    process.env.DEV_LOGIN === "true" &&
    process.env.NODE_ENV !== "production";

  if (!enabled) notFound();

  const users = await prisma.user.findMany({
    where: { tgId: { startsWith: "9000000" } },
    orderBy: { tgId: "asc" },
  });

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        dev · login
      </p>
      <h1 className="mt-4 font-heading text-3xl uppercase">
        Вход без Telegram
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-steel">
        Выбери персонажа. Создаётся реальная сессия в БД; роль и ранг берутся из
        профиля.
      </p>

      <div className="mt-6 space-y-2">
        {users.map((user) => (
          <form
            key={user.id}
            action={devLoginAction}
            className="flex flex-wrap items-center justify-between gap-3 border border-graphite bg-concrete px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-ash">
                {user.displayName ?? user.username ?? user.tgId}
              </p>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
                {user.role} · {user.rank} · {user.xp} XP
              </p>
            </div>
            <input type="hidden" name="tgId" value={user.tgId ?? ""} />
            <button
              type="submit"
              className="border border-graphite px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash transition-colors hover:border-blood"
            >
              Войти
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
