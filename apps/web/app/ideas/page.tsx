import type { Metadata } from "next";

import { TLink } from "@/components/motion/TLink";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { createIdeaAction, voteIdeaAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Идеи",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "новая",
  UNDER_REVIEW: "на рассмотрении",
  PLANNED: "запланирована",
  IN_PROGRESS: "в работе",
  DONE: "реализована",
  REJECTED: "отклонена",
};

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getSessionUser();
  const ideas = await prisma.idea.findMany({
    include: { votes: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-12">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        /ideas
      </p>
      <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.9]">
        Идеи
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
        Предложи, что улучшить. Голос весомее у высокого ранга и тарифа: R4 ×1.5,
        R6 ×2, T3+ ×3.
      </p>

      {error ? (
        <p className="mt-4 border border-blood/40 bg-blood/5 px-4 py-2 text-xs text-ember">
          Не получилось: заголовок ≥4, текст ≥10 символов.
        </p>
      ) : null}

      {user ? (
        <form
          action={createIdeaAction}
          className="mt-8 grid gap-3 border border-graphite bg-concrete p-5"
        >
          <input
            name="title"
            required
            minLength={4}
            maxLength={140}
            placeholder="Заголовок идеи"
            className="w-full border border-graphite bg-void px-3 py-2 text-sm text-ash outline-none focus:border-ember"
          />
          <textarea
            name="body"
            required
            minLength={10}
            maxLength={4000}
            rows={4}
            placeholder="Что и зачем?"
            className="w-full border border-graphite bg-void px-3 py-2 text-sm text-ash outline-none focus:border-ember"
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              name="category"
              defaultValue="site"
              className="border border-graphite bg-void px-3 py-2 text-xs text-ash"
            >
              <option value="site">сайт</option>
              <option value="content">контент</option>
              <option value="bot">бот</option>
              <option value="events">мероприятия</option>
              <option value="other">другое</option>
            </select>
            <button
              type="submit"
              className="border border-blood bg-blood px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ash transition-colors hover:bg-blood-deep"
            >
              Отправить идею
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-6 text-sm text-steel">
          Войди, чтобы предложить идею.{" "}
          <TLink href="/login" className="text-ash underline">
            Войти
          </TLink>
        </p>
      )}

      <div className="mt-10 space-y-3">
        {ideas.map((idea) => {
          const score = idea.votes.reduce(
            (sum, vote) => sum + vote.weight,
            0,
          );
          const voted = user
            ? idea.votes.some((vote) => vote.userId === user.id)
            : false;

          return (
            <article
              key={idea.id}
              className="flex gap-4 border border-graphite bg-concrete p-4"
            >
              <form action={voteIdeaAction} className="shrink-0">
                <input type="hidden" name="ideaId" value={idea.id} />
                <input type="hidden" name="path" value="/ideas" />
                <button
                  type="submit"
                  disabled={!user}
                  aria-pressed={voted}
                  className={`flex h-14 w-14 flex-col items-center justify-center border transition-colors ${
                    voted
                      ? "border-blood text-ember"
                      : "border-graphite text-steel"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span>{voted ? "▼" : "▲"}</span>
                  <span className="font-mono text-[0.6rem]">{score}</span>
                </button>
              </form>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TLink
                    href={`/ideas/${idea.id}`}
                    className="font-heading text-xl uppercase transition-colors hover:text-ember"
                  >
                    {idea.title}
                  </TLink>
                  <span className="border border-graphite px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel">
                    {STATUS_LABEL[idea.status] ?? idea.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-steel">
                  {idea.body}
                </p>
                <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
                  {idea.category} ·{" "}
                  {idea.user.displayName ?? idea.user.username ?? "участник"} ·{" "}
                  {new Date(idea.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
            </article>
          );
        })}

        {ideas.length === 0 ? (
          <p className="text-sm text-steel">Здесь пока темно.</p>
        ) : null}
      </div>
    </main>
  );
}
