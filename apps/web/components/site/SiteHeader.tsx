import { TLink } from "@/components/motion/TLink";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/auth-actions";

const NAV = [
  ["Основатели", "/founders"],
  ["Лор", "/lore"],
  ["Ранги", "/ranks"],
  ["Видео", "/vault"],
  ["Идеи", "/ideas"],
] as const;

export async function SiteHeader() {
  const user = await getSessionUser();
  const isStaff = user?.role === "OWNER" || user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-graphite/60 bg-void/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <TLink
          href="/"
          className="font-heading text-lg uppercase tracking-[0.22em] text-ash"
        >
          LoxRate
        </TLink>

        <nav
          aria-label="Разделы"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel"
        >
          {NAV.map(([label, href]) => (
            <TLink
              key={href}
              href={href}
              className="transition-colors hover:text-ash"
            >
              {label}
            </TLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel">
          {isStaff ? (
            <TLink href="/admin" className="text-ember transition-colors hover:text-ash">
              Админ
            </TLink>
          ) : null}
          {user ? (
            <>
              <TLink href="/me" className="transition-colors hover:text-ash">
                {user.displayName ?? user.username ?? "Профиль"}
              </TLink>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="transition-colors hover:text-ash"
                >
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <TLink
              href="/login"
              className="text-ash transition-colors hover:text-ember"
            >
              Войти
            </TLink>
          )}
        </div>
      </div>
    </header>
  );
}
