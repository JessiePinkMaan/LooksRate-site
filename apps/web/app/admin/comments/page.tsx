import { prisma } from "@/lib/db";

import { moderateCommentAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    include: { user: true, _count: { select: { reports: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-2xl uppercase">
        Комментарии ({comments.length})
      </h2>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border border-graphite bg-concrete p-4"
        >
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
            {comment.status} · {comment.targetType}:
            {comment.targetId.slice(0, 8)} ·{" "}
            {comment.user.displayName ?? comment.user.username ?? "участник"} ·
            жалоб {comment._count.reports}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ash">
            {comment.body}
          </p>
          <form
            action={moderateCommentAction}
            className="mt-3 flex flex-wrap gap-2"
          >
            <input type="hidden" name="commentId" value={comment.id} />
            <button
              type="submit"
              name="action"
              value="hide"
              className="border border-graphite px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
            >
              Скрыть
            </button>
            <button
              type="submit"
              name="action"
              value="delete"
              className="border border-graphite px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ember transition-colors hover:border-ember"
            >
              Удалить
            </button>
            <button
              type="submit"
              name="action"
              value="restore"
              className="border border-graphite px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
            >
              Вернуть
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
