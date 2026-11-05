import { getSessionUser } from "@/lib/auth";
import {
  createCommentAction,
  deleteCommentAction,
  editCommentAction,
  reportCommentAction,
} from "@/lib/community-actions";
import { prisma } from "@/lib/db";

import { ReactionBar } from "./ReactionBar";

/**
 * Комментарии к видео/идее (ТЗ §13.2): ветки не реализованы, но есть
 * создание, правка 5 минут, удаление, жалоба и реакции.
 */
export async function Comments({
  targetType,
  targetId,
  path,
}: {
  targetType: "video" | "idea";
  targetId: string;
  path: string;
}) {
  const user = await getSessionUser();

  const comments = await prisma.comment.findMany({
    where: { targetType, targetId, status: "VISIBLE" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const reactions = comments.length
    ? await prisma.reaction.findMany({
        where: {
          targetType: "comment",
          targetId: { in: comments.map((comment) => comment.id) },
        },
      })
    : [];

  const isStaff =
    user?.role === "OWNER" ||
    user?.role === "ADMIN" ||
    user?.role === "MODERATOR";

  return (
    <section className="mt-10 border-t border-graphite/60 pt-8">
      <h2 className="font-heading text-2xl uppercase">Комментарии</h2>

      {user ? (
        <form action={createCommentAction} className="mt-4">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <input type="hidden" name="path" value={path} />
          <textarea
            name="body"
            required
            minLength={3}
            maxLength={2000}
            rows={3}
            placeholder="Скажи по делу…"
            className="w-full border border-graphite bg-void px-3 py-2 text-sm text-ash outline-none focus:border-ember"
          />
          <button
            type="submit"
            className="mt-2 border border-graphite px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash transition-colors hover:border-blood"
          >
            Отправить
          </button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-steel">
          Войди, чтобы комментировать.
        </p>
      )}

      <div className="mt-6 space-y-5">
        {comments.map((comment) => {
          const commentReactions = reactions.filter(
            (reaction) => reaction.targetId === comment.id,
          );
          const canEdit =
            user &&
            comment.userId === user.id &&
            Date.now() - comment.createdAt.getTime() < 5 * 60 * 1000;
          const canDelete =
            user && (comment.userId === user.id || isStaff);

          return (
            <article
              key={comment.id}
              className="border-l border-graphite pl-4"
            >
              <div className="flex flex-wrap items-center gap-3 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
                <span className="text-ash">
                  {comment.user.displayName ??
                    comment.user.username ??
                    "участник"}
                </span>
                <span>
                  {new Date(comment.createdAt).toLocaleString("ru-RU")}
                </span>
                {comment.editedAt ? <span>изменено</span> : null}
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ash">
                {comment.body}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <ReactionBar
                  targetType="comment"
                  targetId={comment.id}
                  reactions={commentReactions}
                  user={user}
                  path={path}
                />

                {canEdit ? (
                  <details className="text-xs text-steel">
                    <summary className="cursor-pointer hover:text-ash">
                      Изменить
                    </summary>
                    <form action={editCommentAction} className="mt-2">
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="path" value={path} />
                      <textarea
                        name="body"
                        defaultValue={comment.body}
                        required
                        minLength={3}
                        maxLength={2000}
                        rows={2}
                        className="w-full border border-graphite bg-void px-2 py-1 text-sm text-ash outline-none focus:border-ember"
                      />
                      <button
                        type="submit"
                        className="mt-1 border border-graphite px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel hover:text-ash"
                      >
                        Сохранить
                      </button>
                    </form>
                  </details>
                ) : null}

                {canDelete ? (
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="id" value={comment.id} />
                    <input type="hidden" name="path" value={path} />
                    <button
                      type="submit"
                      className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ember hover:underline"
                    >
                      Удалить
                    </button>
                  </form>
                ) : null}

                {user && !canDelete ? (
                  <form action={reportCommentAction}>
                    <input type="hidden" name="id" value={comment.id} />
                    <input type="hidden" name="path" value={path} />
                    <button
                      type="submit"
                      className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel hover:text-ash"
                    >
                      Пожаловаться
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          );
        })}

        {comments.length === 0 ? (
          <p className="text-sm text-steel">Здесь пока темно.</p>
        ) : null}
      </div>
    </section>
  );
}
