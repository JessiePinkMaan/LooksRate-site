import type { Reaction, User } from "@loxrate/db";

import { toggleReactionAction } from "@/lib/community-actions";

const KINDS = [
  { kind: "WHALE", emoji: "🐳" },
  { kind: "HOTDOG", emoji: "🌭" },
  { kind: "DISLIKE", emoji: "👎" },
] as const;

export function ReactionBar({
  targetType,
  targetId,
  reactions,
  user,
  path,
}: {
  targetType: "video" | "comment";
  targetId: string;
  reactions: Reaction[];
  user: User | null;
  path: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {KINDS.map(({ kind, emoji }) => {
        const count = reactions.filter(
          (reaction) => reaction.kind === kind,
        ).length;
        const active = user
          ? reactions.some(
              (reaction) =>
                reaction.kind === kind && reaction.userId === user.id,
            )
          : false;

        return (
          <form key={kind} action={toggleReactionAction}>
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="path" value={path} />
            <button
              type="submit"
              disabled={!user}
              aria-pressed={active}
              title={user ? emoji : "Войди, чтобы реагировать"}
              className={`px-2 py-1 text-sm transition-colors ${
                active ? "text-ember" : "text-steel hover:text-ash"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {emoji}
              {count > 0 ? ` ${count}` : ""}
            </button>
          </form>
        );
      })}
    </div>
  );
}
