import type { CSSProperties } from "react";

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

function introItem(index: number): CSSProperties {
  return { "--intro-index": index } as CSSProperties;
}

export async function SiteHeader() {
  const user = await getSessionUser();
  const isStaff = user?.role === "OWNER" || user?.role === "ADMIN";

  return (
    <header className="site-header sticky top-0 z-40 border-b border-graphite/60 bg-void/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <TLink
          href="/"
          className="font-heading text-lg uppercase tracking-[0.22em] text-ash"
          data-intro-item
          style={introItem(0)}
        >
          LoxRate
        </TLink>

        <nav
          aria-label="Разделы"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel"
        >
          {NAV.map(([label, href], index) => (
            <TLink
              key={href}
              href={href}
              className="transition-colors hover:text-ash"
              data-intro-item
              style={introItem(index + 1)}
            >
              {label}
            </TLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel">
          <TLink
            href="/settings"
            aria-label="Настройки"
            className="text-steel transition-colors hover:text-ash"
            data-intro-item
            style={introItem(6)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h10M18 17h2" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="9" cy="12" r="2" />
              <circle cx="16" cy="17" r="2" />
            </svg>
          </TLink>
          {isStaff ? (
            <TLink
              href="/admin"
              className="text-ember transition-colors hover:text-ash"
              data-intro-item
              style={introItem(7)}
            >
              Админ
            </TLink>
          ) : null}
          {user ? (
            <>
              <TLink
                href="/me"
                className="transition-colors hover:text-ash"
                data-intro-item
                style={introItem(8)}
              >
                {user.displayName ?? user.username ?? "Профиль"}
              </TLink>
              <form action={logoutAction} data-intro-item style={introItem(9)}>
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
              data-intro-item
              style={introItem(8)}
            >
              Войти
            </TLink>
          )}
        </div>
      </div>
    </header>
  );
}
