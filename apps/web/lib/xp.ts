import "server-only";

import { prisma } from "./db";

type AwardXpInput = {
  userId: string;
  type: string;
  amount: number;
  refType?: string;
  refId?: string;
  idempotencyKey: string;
  dailyCap?: number;
};

function startOfDay(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Единственная точка начисления XP (ТЗ §10.3): журнал `xp_events`,
 * идемпотентность по ключу, дневные капы, пересчёт ранга.
 */
export async function awardXp(input: AwardXpInput): Promise<number> {
  const existing = await prisma.xpEvent.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return 0;

  if (input.dailyCap) {
    const count = await prisma.xpEvent.count({
      where: {
        userId: input.userId,
        type: input.type,
        createdAt: { gte: startOfDay() },
      },
    });
    if (count >= input.dailyCap) return 0;
  }

  await prisma.xpEvent.create({
    data: {
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      refType: input.refType ?? null,
      refId: input.refId ?? null,
      idempotencyKey: input.idempotencyKey,
    },
  });

  const user = await prisma.user.update({
    where: { id: input.userId },
    data: { xp: { increment: input.amount } },
  });

  const ranks = await prisma.rankConfig.findMany({
    orderBy: { minXp: "desc" },
  });
  const nextRank = ranks.find((rank) => user.xp >= rank.minXp)?.rank;
  if (nextRank && nextRank !== user.rank) {
    await prisma.user.update({
      where: { id: user.id },
      data: { rank: nextRank },
    });
  }

  return input.amount;
}
