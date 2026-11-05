import type { Metadata } from "next";

import { TLink } from "@/components/motion/TLink";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Зал славы",
};

export default async function HallPage() {
  const [users, ideas] = await Promise.all([
    prisma.user.findMany({
      where: { status: "ACTIVE", xp: { gt: 0 } },
      orderBy: { xp: "desc" },
      take: 20,
    }),
    prisma.idea.findMany({ include: { votes: true }, take: 100 }),
  ]);

  const topIdea = ideas
    .map((idea) => ({
      ...idea,
      score: idea.votes.reduce((sum, vote) => sum + vote.weight, 0),
    }))
    .sort((a, b) => b.score - a.score)[0];

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        /hall
      </p>
      <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.9]">
        Зал славы
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
        Сезонный топ по XP. Показываются только ники и ранги — без личных данных.
      </p>

      <ol className="mt-8 space-y-2">
        {users.map((user, index) => (
          <li
            key={user.id}
            className="flex items-center gap-4 border border-graphite bg-concrete p-4"
          >
            <span className="w-8 shrink-0 font-mono text-sm text-ember">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 text-sm text-ash">
              {user.displayName ?? user.username ?? "участник"}
            </span>
            <span className="shrink-0 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
              {user.rank} · {user.xp} XP
            </span>
          </li>
        ))}
      </ol>

      {topIdea ? (
        <section className="mt-10 border border-gold-apple/30 bg-[radial-gradient(circle_at_50%_20%,rgba(201,162,39,0.10),transparent_60%)] p-6">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-gold-apple">
            Идея месяца
          </p>
          <h2 className="mt-2 font-heading text-2xl uppercase">
            <TLink href={`/ideas/${topIdea.id}`} className="hover:text-ember">
              {topIdea.title}
            </TLink>
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-steel">
            {topIdea.body}
          </p>
          <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
            голоса: {topIdea.score}
          </p>
        </section>
      ) : null}
    </main>
  );
}
