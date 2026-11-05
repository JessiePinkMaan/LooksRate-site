"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { Role } from "@loxrate/db";

import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createVideoSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,80}$/, "slug: только a-z, 0-9 и дефис"),
  description: z.string().trim().max(2000).optional(),
  accessType: z.enum(["PUBLIC", "AUTH", "RANK", "TIER", "RANK_AND_TIER"]),
  minRank: z.string().trim().optional(),
  minTier: z.string().trim().optional(),
});

export async function createVideoAction(formData: FormData): Promise<void> {
  const staff = await requireStaff();

  const parsed = createVideoSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    accessType: formData.get("accessType"),
    minRank: formData.get("minRank") || undefined,
    minTier: formData.get("minTier") || undefined,
  });

  if (!parsed.success) {
    redirect("/admin/videos?error=validation");
  }

  const { title, slug, description, accessType, minRank, minTier } = parsed.data;
  const needsRank = accessType === "RANK" || accessType === "RANK_AND_TIER";
  const needsTier = accessType === "TIER" || accessType === "RANK_AND_TIER";

  try {
    const video = await prisma.video.create({
      data: {
        title,
        slug,
        description: description ?? null,
        status: "READY",
        publishAt: new Date(),
        createdById: staff.id,
        accessRules: {
          create: [
            {
              type: accessType,
              minRank: needsRank ? (minRank ?? "R3") : null,
              minTier: needsTier ? (minTier ?? "T2") : null,
            },
          ],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: staff.id,
        actorRole: staff.role,
        action: "video.create",
        entityType: "video",
        entityId: video.id,
        afterJson: { title, slug, accessType },
      },
    });
  } catch (error) {
    console.error("[admin] Не удалось создать видео:", error);
    redirect("/admin/videos?error=failed");
  }

  revalidatePath("/admin/videos");
  revalidatePath("/vault");
  redirect("/admin/videos");
}

export async function toggleVideoAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/videos");

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) redirect("/admin/videos");

  await prisma.video.update({
    where: { id },
    data: { publishAt: video.publishAt ? null : new Date() },
  });

  revalidatePath("/admin/videos");
  revalidatePath("/vault");
  redirect("/admin/videos");
}

export async function deleteVideoAction(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/videos");

  await prisma.video.delete({ where: { id } });
  await prisma.auditLog.create({
    data: {
      actorId: staff.id,
      actorRole: staff.role,
      action: "video.delete",
      entityType: "video",
      entityId: id,
    },
  });

  revalidatePath("/admin/videos");
  revalidatePath("/vault");
  redirect("/admin/videos");
}

const roleSchema = z.enum(["USER", "EDITOR", "MODERATOR", "ADMIN", "OWNER"]);

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const userId = String(formData.get("userId") ?? "");
  const parsed = roleSchema.safeParse(formData.get("role"));

  if (!userId || !parsed.success) {
    redirect("/admin/users");
  }

  const role: Role = parsed.data;
  const allowed =
    staff.role === "OWNER"
      ? ["USER", "EDITOR", "MODERATOR", "ADMIN", "OWNER"]
      : ["USER", "EDITOR", "MODERATOR", "ADMIN"];

  if (!allowed.includes(role)) {
    redirect("/admin/users");
  }

  const before = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await prisma.auditLog.create({
    data: {
      actorId: staff.id,
      actorRole: staff.role,
      action: "user.role",
      entityType: "user",
      entityId: userId,
      beforeJson: before ? { role: before.role } : undefined,
      afterJson: { role },
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
