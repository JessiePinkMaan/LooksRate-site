"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { awardXp } from "@/lib/xp";

const commentSchema = z.object({
  targetType: z.enum(["video", "idea"]),
  targetId: z.string().min(1),
  body: z.string().trim().min(3).max(2000),
  path: z.string().startsWith("/"),
});

export async function createCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const parsed = commentSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    body: formData.get("body"),
    path: formData.get("path"),
  });

  if (!parsed.success) redirect("/ideas?error=comment");

  const { targetType, targetId, body, path } = parsed.data;

  const comment = await prisma.comment.create({
    data: { userId: user.id, targetType, targetId, body },
  });

  await awardXp({
    userId: user.id,
    type: "comment",
    amount: 5,
    refType: "comment",
    refId: comment.id,
    idempotencyKey: `comment:${comment.id}`,
    dailyCap: 5,
  });

  revalidatePath(path);
  redirect(path);
}

export async function editCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const path = String(formData.get("path") ?? "/ideas");

  if (!id || body.length < 3 || body.length > 2000) redirect(path);

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.userId !== user.id) redirect(path);
  if (Date.now() - comment.createdAt.getTime() > 5 * 60 * 1000) redirect(path);

  await prisma.comment.update({
    where: { id },
    data: { body, editedAt: new Date() },
  });

  revalidatePath(path);
  redirect(path);
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "/ideas");
  if (!id) redirect(path);

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) redirect(path);

  const isStaff =
    user.role === "OWNER" ||
    user.role === "ADMIN" ||
    user.role === "MODERATOR";
  if (comment.userId !== user.id && !isStaff) redirect(path);

  await prisma.comment.update({
    where: { id },
    data: { status: "DELETED" },
  });

  revalidatePath(path);
  redirect(path);
}

export async function reportCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "/ideas");
  if (!id) redirect(path);

  try {
    await prisma.commentReport.create({
      data: { commentId: id, reporterId: user.id, reason: "жалоба" },
    });
  } catch {
    // повторная жалоба того же пользователя - игнорируем
  }

  revalidatePath(path);
  redirect(path);
}

const reactionSchema = z.object({
  targetType: z.enum(["video", "comment"]),
  targetId: z.string().min(1),
  kind: z.enum(["WHALE", "HOTDOG", "DISLIKE"]),
  path: z.string().startsWith("/"),
});

export async function toggleReactionAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const parsed = reactionSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    kind: formData.get("kind"),
    path: formData.get("path"),
  });

  if (!parsed.success) redirect("/ideas");

  const { targetType, targetId, kind, path } = parsed.data;

  const existing = await prisma.reaction.findUnique({
    where: {
      userId_targetType_targetId_kind: {
        userId: user.id,
        targetType,
        targetId,
        kind,
      },
    },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({
      data: { userId: user.id, targetType, targetId, kind },
    });
  }

  revalidatePath(path);
  redirect(path);
}
