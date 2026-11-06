import type { Metadata } from "next";

import { RivetedCard } from "@loxrate/ui";

import { TLink } from "@/components/motion/TLink";
import { FriendsPanel, type FriendRow } from "@/components/profile/FriendsPanel";
import { ProfileStudio } from "@/components/profile/ProfileStudio";
import { QuoteBoard, type QuoteRow } from "@/components/profile/QuoteBoard";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/auth-actions";
import { profile } from "@/lib/content";
import { prisma } from "@/lib/db";
import { parseProfileTheme } from "@/lib/profile-theme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Профиль",
  robots: { index: false, follow: false },
};

const activityCopy = profile.activity;

const XP_LABELS: Record<string, string> = {
  comment: "Комментарий",
  idea: "Идея",
  daily: "Вход в подвал",
  rank: "Новый ранг",
};

function displayName(user: {
  displayName: string | null;
  username: string | null;
}): string {
  return user.displayName ?? user.username ?? "Безымянный";
}

function otherSide(
  friendship: {
    requesterId: string;
    requester: {
      id: string;
      username: string | null;
      displayName: string | null;
      rank: string;
      profileTheme: unknown;
    };
    addressee: {
      id: string;
      username: string | null;
      displayName: string | null;
      rank: string;
      profileTheme: unknown;
    };
  },
  userId: string,
) {
  return friendship.requesterId === userId
    ? friendship.addressee
    : friendship.requester;
}

function toFriendRow(
  friendship: {
    id: string;
    requesterId: string;
    requester: {
      id: string;
      username: string | null;
      displayName: string | null;
      rank: string;
      profileTheme: unknown;
    };
    addressee: {
      id: string;
      username: string | null;
      displayName: string | null;
      rank: string;
      profileTheme: unknown;
    };
  },
  userId: string,
): FriendRow {
  const other = otherSide(friendship, userId);
  return {
    friendshipId: friendship.id,
    name: displayName(other),
    username: other.username ?? "-",
    rank: other.rank,
    aura: parseProfileTheme(other.profileTheme).aura,
  };
}

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const user = await requireUser();

  const [
    subscriptions,
    achievements,
    notifications,
    watchHistory,
    xpEvents,
    commentCount,
    ideaCount,
    friendships,
    userQuotes,
  ] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: user.id },
      include: { tier: true },
      orderBy: { expiresAt: "desc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.watchProgress.findMany({
      where: { userId: user.id },
      include: { video: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.xpEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.comment.count({
      where: { userId: user.id, status: { not: "DELETED" } },
    }),
    prisma.idea.count({ where: { userId: user.id } }),
    prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
      include: { requester: true, addressee: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userQuote.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const activeSubscription = subscriptions.find(
    (subscription) =>
      subscription.status === "ACTIVE" || subscription.status === "GRACE",
  );

  const accepted = friendships.filter(
    (friendship) => friendship.status === "ACCEPTED",
  );
  const incoming = friendships.filter(
    (friendship) =>
      friendship.status === "PENDING" && friendship.addresseeId === user.id,
  );
  const outgoing = friendships.filter(
    (friendship) =>
      friendship.status === "PENDING" && friendship.requesterId === user.id,
  );

  const sceneFriends = accepted.map((friendship, index) => {
    const other = otherSide(friendship, user.id);
    return {
      id: other.id,
      name: displayName(other),
      rank: other.rank,
      theme: parseProfileTheme(other.profileTheme),
      asset: index % 2 === 0 ? ("a" as const) : ("b" as const),
    };
  });

  const theme = parseProfileTheme(user.profileTheme);

  const quoteRows: QuoteRow[] = userQuotes.map((quote) => ({
    id: quote.id,
    text: quote.text,
    date: quote.createdAt.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.5em] text-steel">
            /me
          </p>
          <h1 className="mt-2 font-heading text-5xl uppercase leading-[0.95]">
            {displayName(user)}
          </h1>
          <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
            {user.role} · @{user.username ?? "-"}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="border border-graphite px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
          >
            Выйти
          </button>
        </form>
      </div>

      <ProfileStudio
        user={{
          name: displayName(user),
          rank: user.rank,
          theme,
        }}
        friends={sceneFriends}
        saved={saved === "1"}
        quote={quoteRows[0]?.text}
        stats={
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <RivetedCard label={profile.stats.rank} number={`${user.xp} XP`}>
              <p className="font-heading text-3xl uppercase">{user.rank}</p>
            </RivetedCard>
            <RivetedCard
              label={profile.stats.streak}
              number={profile.stats.days}
            >
              <p className="font-heading text-3xl uppercase">{user.streak}</p>
            </RivetedCard>
            <RivetedCard
              label={profile.stats.access}
              number={activeSubscription ? activeSubscription.tier.key : "T0"}
            >
              <p className="font-heading text-2xl uppercase">
                {activeSubscription ? activeSubscription.tier.name : "Гость"}
              </p>
            </RivetedCard>
            <RivetedCard label={profile.stats.xp} number="всего">
              <p className="font-heading text-3xl uppercase">{user.xp}</p>
            </RivetedCard>
          </div>
        }
        friendsPanel={
          <FriendsPanel
            accepted={accepted.map((friendship) =>
              toFriendRow(friendship, user.id),
            )}
            incoming={incoming.map((friendship) =>
              toFriendRow(friendship, user.id),
            )}
            outgoing={outgoing.map((friendship) =>
              toFriendRow(friendship, user.id),
            )}
          />
        }
      />

      <div className="mt-12">
        <QuoteBoard quotes={quoteRows} />
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-heading text-3xl uppercase">
            {activityCopy.title}
          </h2>
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.24em] text-steel">
            {activityCopy.memberSince}{" "}
            {new Date(user.createdAt).toLocaleDateString("ru-RU")}
            {user.lastLoginAt
              ? ` · ${activityCopy.lastSeen} ${new Date(
                  user.lastLoginAt,
                ).toLocaleDateString("ru-RU")}`
              : ""}
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="border border-graphite bg-concrete/60 p-5">
            <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-steel">
              {activityCopy.history}
            </h3>
            {watchHistory.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {watchHistory.map((entry) => {
                  const percent =
                    entry.video.duration && entry.video.duration > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (entry.maxPosition / entry.video.duration) * 100,
                          ),
                        )
                      : 0;
                  return (
                    <li
                      key={entry.id}
                      className="border border-graphite/70 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-heading text-lg uppercase leading-tight">
                          {entry.video.title}
                        </p>
                        <TLink
                          href={`/vault/${entry.video.slug}`}
                          className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-gold-apple"
                        >
                          {entry.completedAt
                            ? activityCopy.completed
                            : activityCopy.continue}{" "}
                          →
                        </TLink>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="h-px flex-1 bg-graphite">
                          <span
                            className="block h-px bg-gold-apple/70"
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                        <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel">
                          {percent}%
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-steel">
                {activityCopy.historyEmpty}
              </p>
            )}
          </div>

          <div className="space-y-5">
            <div className="border border-graphite bg-concrete/60 p-5">
              <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-steel">
                {activityCopy.xp}
              </h3>
              {xpEvents.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {xpEvents.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center justify-between gap-3 font-mono text-[0.6rem] uppercase tracking-[0.12em]"
                    >
                      <span className="text-steel">
                        {XP_LABELS[event.type] ?? event.type}
                      </span>
                      <span className="text-gold-apple">
                        +{event.amount} XP
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-steel">
                  {activityCopy.xpEmpty}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                [activityCopy.comments, commentCount],
                [activityCopy.ideas, ideaCount],
                [activityCopy.achievements, achievements.length],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="border border-graphite bg-concrete/60 p-3 text-center"
                >
                  <p className="font-heading text-2xl uppercase">{value}</p>
                  <p className="mt-1 font-mono text-[0.45rem] uppercase tracking-[0.16em] text-steel">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl uppercase">
          {activityCopy.achievements}
        </h2>
        {achievements.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {achievements.map((entry) => (
              <li
                key={entry.id}
                className="border border-graphite bg-concrete p-4"
              >
                <p className="font-heading text-lg uppercase">
                  {entry.achievement.name}
                </p>
                <p className="mt-1 text-xs text-steel">
                  {entry.achievement.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-steel">Пока пусто. Здесь пока темно.</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl uppercase">Уведомления</h2>
        {notifications.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="border border-graphite bg-concrete p-4 text-sm text-steel"
              >
                {notification.kind === "IDEA_STATUS"
                  ? "Статус твоей идеи изменён."
                  : notification.kind === "COMMENT_REPLY"
                    ? "Ответ на твой комментарий."
                    : notification.kind === "RANK_UP"
                      ? "Новый ранг."
                      : "Уведомление."}
                <span className="ml-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
                  {new Date(notification.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-steel">Пока тихо.</p>
        )}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <TLink
          href="/vault"
          className="border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
        >
          Перейти к видео →
        </TLink>
        <TLink
          href="/ranks"
          className="border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
        >
          Лестница рангов
        </TLink>
      </div>
    </main>
  );
}
