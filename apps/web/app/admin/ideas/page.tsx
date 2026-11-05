import { prisma } from "@/lib/db";

import { updateIdeaStatusAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = [
  "NEW",
  "UNDER_REVIEW",
  "PLANNED",
  "IN_PROGRESS",
  "DONE",
  "REJECTED",
];

export default async function AdminIdeasPage() {
  const ideas = await prisma.idea.findMany({
    include: { user: true, votes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-2xl uppercase">
        Идеи ({ideas.length})
      </h2>
      {ideas.map((idea) => {
        const score = idea.votes.reduce(
          (sum, vote) => sum + vote.weight,
          0,
        );
        return (
          <div
            key={idea.id}
            className="border border-graphite bg-concrete p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-heading text-lg uppercase">{idea.title}</p>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
                голоса {score}
              </p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-steel">
              {idea.body.slice(0, 180)}
            </p>
            <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
              {idea.category} ·{" "}
              {idea.user.displayName ?? idea.user.username ?? "участник"}
            </p>

            <form
              action={updateIdeaStatusAction}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="ideaId" value={idea.id} />
              <select
                name="status"
                defaultValue={idea.status}
                className="border border-graphite bg-void px-2 py-1 text-xs text-ash"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="border border-graphite px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
              >
                Сохранить
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
