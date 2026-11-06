"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { Prisma } from "@loxrate/db";

import { requireUser } from "@/lib/auth";
import { profile } from "@/lib/content";
import { prisma } from "@/lib/db";
import {
  PROFILE_AURAS,
  PROFILE_BACKDROPS,
  PROFILE_ITEMS,
} from "@/lib/profile-theme";
import { QUOTE_LIMIT, checkQuote } from "@/lib/quote";

const copy = profile.friends;

const themeSchema = z.object({
  aura: z.enum(PROFILE_AURAS),
  item: z.enum(PROFILE_ITEMS),
  backdrop: z.enum(PROFILE_BACKDROPS),
});

export async function updateProfileThemeAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();

  const parsed = themeSchema.safeParse({
    aura: formData.get("aura"),
    item: formData.get("item"),
    backdrop: formData.get("backdrop"),
  });

  if (!parsed.success) redirect("/me#oblik");

  await prisma.user.update({
    where: { id: user.id },
    data: { profileTheme: parsed.data },
  });

  revalidatePath("/me");
  redirect("/me?saved=1#oblik");
}

export type FriendState = {
  error?: string;
  success?: string;
};

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, copy.errorNotFound)
  .max(24, copy.errorNotFound)
  .regex(/^[a-z0-9_]+$/, copy.errorNotFound);

export async function sendFriendRequestAction(
  _previous: FriendState,
  formData: FormData,
): Promise<FriendState> {
  const user = await requireUser();

  const parsed = usernameSchema.safeParse(formData.get("username"));
  if (!parsed.success) return { error: copy.errorNotFound };

  const target = await prisma.user.findFirst({
    where: { username: parsed.data },
  });

  if (!target) return { error: copy.errorNotFound };
  if (target.id === user.id) return { error: copy.errorSelf };

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: user.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: user.id },
      ],
    },
  });

  if (existing) {
    // Встречная заявка - сразу друзья, без лишнего клика.
    if (existing.status === "PENDING" && existing.requesterId === target.id) {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });
      revalidatePath("/me");
      return { success: copy.added };
    }

    // Отклонённую свою заявку можно отправить заново.
    if (existing.status === "DECLINED" && existing.requesterId === user.id) {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "PENDING", respondedAt: null },
      });
      revalidatePath("/me");
      return { success: copy.sent };
    }

    return { error: copy.errorExists };
  }

  try {
    await prisma.friendship.create({
      data: { requesterId: user.id, addresseeId: target.id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: copy.errorExists };
    }
    throw error;
  }

  revalidatePath("/me");
  return { success: copy.sent };
}

export async function respondFriendRequestAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const friendship = await prisma.friendship.findUnique({ where: { id } });

  if (
    !friendship ||
    friendship.addresseeId !== user.id ||
    friendship.status !== "PENDING"
  ) {
    redirect("/me");
  }

  await prisma.friendship.update({
    where: { id },
    data: {
      status: decision === "accept" ? "ACCEPTED" : "DECLINED",
      respondedAt: new Date(),
    },
  });

  revalidatePath("/me");
  redirect("/me");
}

export async function removeFriendAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const friendship = await prisma.friendship.findUnique({ where: { id } });

  if (
    !friendship ||
    (friendship.requesterId !== user.id &&
      friendship.addresseeId !== user.id)
  ) {
    redirect("/me");
  }

  await prisma.friendship.delete({ where: { id } });

  revalidatePath("/me");
  redirect("/me");
}

// ---------------------------------------------------------------------------
// Цитаты на профиле
// ---------------------------------------------------------------------------

const quotesCopy = profile.quotes;

export type QuoteState = {
  error?: string;
  success?: boolean;
};

export async function addQuoteAction(
  _previous: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  const user = await requireUser();

  const checked = checkQuote(formData.get("text"));
  if (!checked.ok) {
    return {
      error:
        checked.reason === "short" ? quotesCopy.tooShort : quotesCopy.tooLong,
    };
  }

  const count = await prisma.userQuote.count({ where: { userId: user.id } });
  if (count >= QUOTE_LIMIT) return { error: quotesCopy.tooMany };

  await prisma.userQuote.create({
    data: { userId: user.id, text: checked.text },
  });

  revalidatePath("/me");
  return { success: true };
}

export async function deleteQuoteAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  await prisma.userQuote.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/me");
}
