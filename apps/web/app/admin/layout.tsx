import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TLink } from "@/components/motion/TLink";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Админка",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const staff = await requireStaff();

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-graphite pb-4">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember">
            /admin
          </p>
          <h1 className="font-heading text-3xl uppercase">Админка</h1>
        </div>
        <nav className="flex flex-wrap gap-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel">
          <TLink href="/admin" className="hover:text-ash">
            Дашборд
          </TLink>
          <TLink href="/admin/videos" className="hover:text-ash">
            Видео
          </TLink>
          <TLink href="/admin/ideas" className="hover:text-ash">
            Идеи
          </TLink>
          <TLink href="/admin/comments" className="hover:text-ash">
            Комментарии
          </TLink>
          <TLink href="/admin/users" className="hover:text-ash">
            Пользователи
          </TLink>
          <TLink href="/vault" className="hover:text-ash">
            К хранилищу
          </TLink>
        </nav>
        <p className="ml-auto font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
          {staff.role}
        </p>
      </div>
      {children}
    </section>
  );
}
