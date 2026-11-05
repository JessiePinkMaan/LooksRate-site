import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Dev-вход без Telegram (ТЗ §25). Реальная выдача сессии — Фаза 6.
 * Доступно только при DEV_LOGIN=true и NODE_ENV !== production.
 */
const characters = [
  { key: "u_r1", label: "Новичок R1 · T0", tgId: "900000010" },
  { key: "u_r4", label: "Боец R4 · T0", tgId: "900000011" },
  { key: "u_t2", label: "Подвал · R2 · T2 активен", tgId: "900000012" },
  { key: "u_t2_grace", label: "T2 в grace-периоде", tgId: "900000013" },
  { key: "u_t2_expired", label: "T2 истёк", tgId: "900000014" },
  { key: "u_t3", label: "Совет · R5 · T3", tgId: "900000015" },
  { key: "editor", label: "Редактор", tgId: "900000004" },
  { key: "moderator", label: "Модератор", tgId: "900000003" },
  { key: "admin", label: "Админ", tgId: "900000002" },
  { key: "owner", label: "Владелец", tgId: "900000001" },
];

export default function DevLoginPage() {
  const enabled =
    process.env.DEV_LOGIN === "true" && process.env.NODE_ENV !== "production";

  if (!enabled) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-steel">
          dev · login
        </p>
        <h1 className="text-2xl font-semibold">Вход без Telegram</h1>
        <p className="text-sm text-steel">
          Заглушка §25. Выбор персонажа. Выдача реальной сессии появится в
          Фазе 6.
        </p>
      </header>

      <ul className="grid gap-2">
        {characters.map((character) => (
          <li
            key={character.key}
            className="flex items-center justify-between border border-graphite bg-concrete px-4 py-3"
          >
            <div>
              <p className="text-sm text-ash">{character.label}</p>
              <p className="font-mono text-xs text-steel">
                {character.key} · tg_id {character.tgId}
              </p>
            </div>
            <span className="font-mono text-xs text-steel/60">скоро</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
