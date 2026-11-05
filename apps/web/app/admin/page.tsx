import { RivetedCard } from "@loxrate/ui";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [users, videos, ideas, comments, subscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.video.count(),
    prisma.idea.count(),
    prisma.comment.count(),
    prisma.subscription.count({
      where: { status: { in: ["ACTIVE", "GRACE"] } },
    }),
  ]);

  const stats = [
    { label: "Пользователи", value: users },
    { label: "Видео", value: videos },
    { label: "Идеи", value: ideas },
    { label: "Комментарии", value: comments },
    { label: "Активные подписки", value: subscriptions },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <RivetedCard key={stat.label} label={stat.label} number="live">
          <p className="font-heading text-4xl">{stat.value}</p>
        </RivetedCard>
      ))}
    </div>
  );
}
