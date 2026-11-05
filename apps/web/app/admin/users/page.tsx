import { prisma } from "@/lib/db";

import { updateUserRoleAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-2xl uppercase">
        Пользователи ({users.length})
      </h2>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-wrap items-center gap-3 border border-graphite bg-concrete p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ash">
              {user.displayName ?? user.username ?? user.tgId ?? user.id}
            </p>
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
              {user.role} · {user.rank} · {user.xp} XP · {user.status} · tg{" "}
              {user.tgId ?? "—"}
            </p>
          </div>
          <form action={updateUserRoleAction} className="flex items-center gap-2">
            <input type="hidden" name="userId" value={user.id} />
            <select
              name="role"
              defaultValue={user.role}
              className="border border-graphite bg-void px-2 py-1 text-xs text-ash"
            >
              {["USER", "EDITOR", "MODERATOR", "ADMIN", "OWNER"].map((role) => (
                <option key={role} value={role}>
                  {role}
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
      ))}
    </div>
  );
}
