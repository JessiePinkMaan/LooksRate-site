import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { TLink } from "@/components/motion/TLink";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/me");

  const devEnabled =
    process.env.DEV_LOGIN === "true" &&
    process.env.NODE_ENV !== "production";

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        /login
      </p>
      <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.95]">
        Вход
      </h1>

      <div className="mt-8 border border-graphite bg-concrete p-6">
        <AuthForm initialMode="login" />
      </div>

      {devEnabled ? (
        <div className="mt-6 border border-graphite/60 p-4">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-steel">
            Dev-доступ
          </p>
          <TLink
            href="/dev/login"
            className="mt-2 inline-block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ember transition-colors hover:text-ash"
          >
            Войти тестовым персонажем →
          </TLink>
        </div>
      ) : null}
    </main>
  );
}
