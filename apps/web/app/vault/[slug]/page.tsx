import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { Video, VideoAccessRule } from "@loxrate/db";

import { TLink } from "@/components/motion/TLink";
import { decideAccess } from "@/lib/access";
import { getSessionUser } from "@/lib/auth";
import { vaultPreview } from "@/lib/content";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type VideoPageProps = {
  params: Promise<{ slug: string }>;
};

type VideoWithRules = Video & { accessRules: VideoAccessRule[] };

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const video = await prisma.video.findUnique({ where: { slug } });
    return { title: video?.title ?? "Видео" };
  } catch {
    const fallback = vaultPreview.videos.find((item) => item.slug === slug);
    return { title: fallback?.title ?? "Видео" };
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const user = await getSessionUser();

  let dbVideo: VideoWithRules | null = null;
  try {
    dbVideo = await prisma.video.findUnique({
      where: { slug },
      include: { accessRules: true },
    });
  } catch (error) {
    console.error("[vault] База недоступна:", error);
  }

  const fallback = vaultPreview.videos.find((item) => item.slug === slug);
  if (!dbVideo && !fallback) notFound();

  let allowed = false;
  let reason = "";
  let title = "";
  let description = "";
  let duration = "--:--";
  let accessLabel = "";

  if (dbVideo) {
    const subscriptions = user
      ? await prisma.subscription.findMany({
          where: { userId: user.id },
          include: { tier: true },
        })
      : [];
    const decision = decideAccess(user, dbVideo, subscriptions);
    allowed = decision.allowed;
    reason = decision.reason;
    title = dbVideo.title;
    description = dbVideo.description ?? "";
    duration = formatDuration(dbVideo.duration);
    const rule = dbVideo.accessRules[0];
    accessLabel = rule
      ? [rule.type, rule.minRank, rule.minTier].filter(Boolean).join(" ")
      : "PUBLIC";
  } else if (fallback) {
    allowed = !fallback.locked;
    reason = fallback.locked ? "нужен ключ" : "открыто";
    title = fallback.title;
    duration = fallback.duration;
    accessLabel = fallback.access;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-12">
      <TLink
        href="/vault"
        className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
      >
        ← все видео
      </TLink>

      {allowed ? (
        <section className="mt-6 border border-graphite bg-concrete">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#1c1c20,#0a0a0b)]">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(179,18,27,0.18),transparent_60%)]" />
            <div className="relative text-center">
              <img
                src="/assets/apple.svg"
                alt=""
                width={48}
                height={48}
                className="mx-auto opacity-80"
              />
              <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-steel">
                Плеер подключается на Фазе 8
              </p>
              <p className="mt-1 text-xs text-steel">
                Видео-файл ещё не загружен · ASSET_NEEDED
              </p>
            </div>
          </div>

          <div className="p-6">
            <h1 className="font-heading text-3xl uppercase">{title}</h1>
            <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
              {accessLabel} · {duration} · доступ открыт
            </p>
            {description ? (
              <p className="mt-4 text-sm leading-relaxed text-steel">
                {description}
              </p>
            ) : null}

            <div className="mt-6 flex gap-4 font-mono text-sm text-steel">
              <span>🐳</span>
              <span>🌭</span>
              <span>👎</span>
            </div>
            <p className="mt-4 text-xs text-steel">
              Реакции и комментарии появятся вместе с сообществом (Фаза 7).
            </p>
          </div>
        </section>
      ) : (
        <section className="mt-6 border border-blood/40 bg-blood/5 p-8 text-center">
          <img
            src="/assets/lock.svg"
            alt=""
            width={40}
            height={40}
            className="mx-auto"
          />
          <h1 className="mt-4 font-heading text-3xl uppercase">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-steel">
            Эта дверь закрыта. Нужен доступ: {reason}.
          </p>
          <TLink
            href="/access"
            className="mt-6 inline-block border border-blood bg-blood px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:bg-blood-deep"
          >
            Получить ключ
          </TLink>
        </section>
      )}
    </main>
  );
}
