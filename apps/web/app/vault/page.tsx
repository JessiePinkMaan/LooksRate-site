import type { Metadata } from "next";

import { cn } from "@loxrate/ui";

import { TLink } from "@/components/motion/TLink";
import { decideAccess } from "@/lib/access";
import { getSessionUser } from "@/lib/auth";
import { vaultPreview } from "@/lib/content";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Видео",
};

type VaultCard = {
  slug: string;
  title: string;
  duration: string;
  accessLabel: string;
  allowed: boolean;
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

async function loadVault(): Promise<VaultCard[]> {
  try {
    const user = await getSessionUser();
    const subscriptions = user
      ? await prisma.subscription.findMany({
          where: { userId: user.id },
          include: { tier: true },
        })
      : [];

    const videos = await prisma.video.findMany({
      where: { status: "READY", publishAt: { not: null, lte: new Date() } },
      include: { accessRules: true },
      orderBy: { publishAt: "desc" },
    });

    return videos.map((video) => {
      const decision = decideAccess(user, video, subscriptions);
      const rule = video.accessRules[0];
      const label = rule
        ? [rule.type, rule.minRank, rule.minTier].filter(Boolean).join(" ")
        : "PUBLIC";
      return {
        slug: video.slug,
        title: video.title,
        duration: formatDuration(video.duration),
        accessLabel: label,
        allowed: decision.allowed,
      };
    });
  } catch (error) {
    console.error("[vault] База недоступна, показываю превью:", error);
    return vaultPreview.videos.map((video) => ({
      slug: video.slug,
      title: video.title,
      duration: video.duration,
      accessLabel: video.access,
      allowed: !video.locked,
    }));
  }
}

export default async function VaultPage() {
  const cards = await loadVault();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        /vault
      </p>
      <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.9] sm:text-7xl">
        Видео
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
        Видео-хранилище клуба LoxRate: записи, разборы и сессии. Часть открыта,
        часть - по рангу или тарифу. Доступ проверяется на сервере.
      </p>
      <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
        PUBLIC - открыто · AUTH - после входа · R3 - по рангу · T2 - по тарифу
      </p>

      {cards.length === 0 ? (
        <p className="mt-10 text-sm text-steel">Здесь пока темно.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <TLink
              key={card.slug}
              href={`/vault/${card.slug}`}
              className="block"
            >
              <article
                className={cn(
                  "group border border-graphite bg-concrete transition-colors hover:border-blood",
                  !card.allowed && "opacity-90",
                )}
              >
                <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#1c1c20,#0a0a0b)]">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(179,18,27,0.18),transparent_60%)]" />
                  <span className="absolute left-3 top-3 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
                    {card.accessLabel}
                  </span>
                  {!card.allowed ? (
                    <img
                      src="/assets/lock.svg"
                      alt="Нужен доступ"
                      width={22}
                      height={22}
                      className="absolute right-3 top-3"
                    />
                  ) : null}
                  <span className="absolute bottom-2 right-3 font-mono text-[0.6rem] text-steel">
                    {card.duration}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-heading text-lg uppercase">{card.title}</p>
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
                    {card.allowed ? "доступно" : "нужен доступ"}
                  </p>
                </div>
              </article>
            </TLink>
          ))}
        </div>
      )}
    </main>
  );
}
