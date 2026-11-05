import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Comments } from "@/components/community/Comments";
import { TLink } from "@/components/motion/TLink";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { voteIdeaAction } from "../actions";

export const dynamic = "force-dynamic";

type IdeaPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "новая",
  UNDER_REVIEW: "на рассмотрении",
  PLANNED: "запланирована",
  IN_PROGRESS: "в работе",
  DONE: "реализована",
  REJECTED: "отклонена",
};

export async function generateMetadata({
  params,
}: IdeaPageProps): Promise<Metadata> {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({ where: { id } });
  return { title: idea?.title ?? "Идея" };
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { id } = await params;
  const user = await getSessionUser();

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      votes: true,
      user: true,
      history: { orderBy: { changedAt: "asc" } },
    },
  });

  if (!idea) notFound();

  const path = `/ideas/${idea.id}`;
  const score = idea.votes.reduce((sum, vote) => sum + vote.weight, 0);
  const voted = user
    ? idea.votes.some((vote) => vote.userId === user.id)
    : false;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <TLink
        href="/ideas"
        className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
      >
        ← все идеи
      </TLink>

      <div className="mt-6 flex items-start gap-4">
        <form action={voteIdeaAction} className="shrink-0">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input type="hidden" name="path" value={path} />
          <button
            type="submit"
            disabled={!user}
            aria-pressed={voted}
            className={`flex h-14 w-14 flex-col items-center justify-center border transition-colors ${
              voted ? "border-blood text-ember" : "border-graphite text-steel"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span>{voted ? "▼" : "▲"}</span>
            <span className="font-mono text-[0.6rem]">{score}</span>
          </button>
        </form>

        <div className="min-w-0">
          <h1 className="font-heading text-4xl uppercase leading-[0.95]">
            {idea.title}
          </h1>
          <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
            {STATUS_LABEL[idea.status] ?? idea.status} · {idea.category} ·{" "}
            {idea.user.displayName ?? idea.user.username ?? "участник"} ·{" "}
            {new Date(idea.createdAt).toLocaleDateString("ru-RU")}
          </p>
        </div>
      </div>

      <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ash">
        {idea.body}
      </p>

      {idea.history.length > 0 ? (
        <ul className="mt-6 space-y-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
          {idea.history.map((entry) => (
            <li key={entry.id}>
              {entry.fromStatus ?? "—"} → {entry.toStatus} ·{" "}
              {new Date(entry.changedAt).toLocaleDateString("ru-RU")}
            </li>
          ))}
        </ul>
      ) : null}

      <Comments targetType="idea" targetId={idea.id} path={path} />
    </main>
  );
}
