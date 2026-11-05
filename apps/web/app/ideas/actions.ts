"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { voteWeight } from "@/lib/community";
import { prisma } from "@/lib/db";
import { awardXp } from "@/lib/xp";

const ideaSchema = z.object({
  title: z.string().trim().min(4).max(140),
  body: z.string().trim().min(10).max(4000),
  category: z.enum(["site", "content", "bot", "events", "other"]),
});

export async function createIdeaAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const parsed = ideaSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    redirect("/ideas?error=validation");
  }

  const idea = await prisma.idea.create({
    data: { userId: user.id, ...parsed.data },
  });

  await awardXp({
    userId: user.id,
    type: "idea_submitted",
    amount: 40,
    refType: "idea",
    refId: idea.id,
    idempotencyKey: `idea-submitted:${idea.id}`,
  });

  revalidatePath("/ideas");
  redirect(`/ideas/${idea.id}`);
}

export async function voteIdeaAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const ideaId = String(formData.get("ideaId") ?? "");
  const path = String(formData.get("path") ?? "/ideas");
  if (!ideaId) redirect(path);

  const existing = await prisma.ideaVote.findUnique({
    where: { ideaId_userId: { ideaId, userId: user.id } },
  });

  if (existing) {
    await prisma.ideaVote.delete({ where: { id: existing.id } });
  } else {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "GRACE"] },
      },
      include: { tier: true },
      orderBy: { expiresAt: "desc" },
    });

    await prisma.ideaVote.create({
      data: {
        ideaId,
        userId: user.id,
        weight: voteWeight(user.rank, subscription?.tier.key ?? null),
      },
    });

    await awardXp({
      userId: user.id,
      type: "idea_vote",
      amount: 1,
      refType: "idea",
      refId: ideaId,
      idempotencyKey: `idea-vote:${ideaId}:${user.id}`,
      dailyCap: 10,
    });
  }

  revalidatePath("/ideas");
  revalidatePath(`/ideas/${ideaId}`);
  redirect(path);
}
