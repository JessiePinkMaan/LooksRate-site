import type { Metadata } from "next";

import { RivetedCard } from "@loxrate/ui";

import { TLink } from "@/components/motion/TLink";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Профиль",
};

export default async function MePage() {
  const user = await requireUser();

  const [subscriptions, achievements] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: user.id },
      include: { tier: true },
      orderBy: { expiresAt: "desc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
  ]);

  const activeSubscription = subscriptions.find(
    (subscription) =>
      subscription.status === "ACTIVE" || subscription.status === "GRACE",
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        /me
      </p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-5xl uppercase leading-[0.95]">
            {user.displayName ?? user.username ?? "Профиль"}
          </h1>
          <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel">
            {user.role} · @{user.username ?? "—"}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="border border-graphite px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
          >
            Выйти
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <RivetedCard label="Ранг" number={`${user.xp} XP`}>
          <p className="font-heading text-3xl uppercase">{user.rank}</p>
        </RivetedCard>
        <RivetedCard label="Серия" number="дней">
          <p className="font-heading text-3xl uppercase">{user.streak}</p>
        </RivetedCard>
        <RivetedCard
          label="Доступ"
          number={activeSubscription ? activeSubscription.tier.key : "T0"}
        >
          <p className="font-heading text-3xl uppercase">
            {activeSubscription ? activeSubscription.tier.name : "Гость"}
          </p>
        </RivetedCard>
      </div>

      <h2 className="mt-10 font-heading text-2xl uppercase">Достижения</h2>
      {achievements.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {achievements.map((entry) => (
            <li
              key={entry.id}
              className="border border-graphite bg-concrete p-4"
            >
              <p className="font-heading text-lg uppercase">
                {entry.achievement.name}
              </p>
              <p className="mt-1 text-xs text-steel">
                {entry.achievement.description}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-steel">Пока пусто. Здесь пока темно.</p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <TLink
          href="/vault"
          className="border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
        >
          Перейти к видео →
        </TLink>
        <TLink
          href="/ranks"
          className="border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
        >
          Лестница рангов
        </TLink>
      </div>
    </main>
  );
}
