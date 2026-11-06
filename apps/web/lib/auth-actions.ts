"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { Prisma } from "@loxrate/db";

import { createSession, destroySession } from "./auth";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./password";

export type AuthState = {
  error?: string;
  success?: boolean;
};

const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Логин - минимум 3 символа")
    .max(24, "Логин - максимум 24 символа")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Логин: латиница, цифры и подчёркивание",
    ),
  password: z
    .string()
    .min(8, "Пароль - минимум 8 символов")
    .max(128, "Пароль - максимум 128 символов"),
});

export async function registerAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверь логин и пароль.",
    };
  }

  if (formData.get("age") !== "on") {
    return { error: "Подтверди, что тебе есть 18." };
  }

  const username = parsed.data.username.toLowerCase();

  const existing = await prisma.user.findFirst({ where: { username } });
  if (existing) {
    return { error: "Этот логин уже занят." };
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        displayName: username,
        passwordHash: hashPassword(parsed.data.password),
        ageConfirmedAt: new Date(),
        termsAcceptedAt: new Date(),
        lastLoginAt: new Date(),
      },
    });

    await createSession(user.id);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Этот логин уже занят." };
    }
    throw error;
  }
}

export async function loginAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Неверный логин или пароль." };
  }

  const username = parsed.data.username.toLowerCase();
  const user = await prisma.user.findFirst({ where: { username } });

  if (!user?.passwordHash) {
    return { error: "Неверный логин или пароль." };
  }

  if (!verifyPassword(parsed.data.password, user.passwordHash)) {
    return { error: "Неверный логин или пароль." };
  }

  if (user.status !== "ACTIVE") {
    return { error: "Аккаунт заблокирован." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(user.id);

  return { success: true };
}

export async function devLoginAction(formData: FormData): Promise<void> {
  const enabled =
    process.env.DEV_LOGIN === "true" &&
    process.env.NODE_ENV !== "production";

  if (!enabled) {
    redirect("/login");
  }

  const tgId = String(formData.get("tgId") ?? "");
  if (!tgId) redirect("/dev/login?error=missing");

  const user = await prisma.user.findUnique({ where: { tgId } });
  if (!user) redirect("/dev/login?error=notfound");

  await createSession(user.id);
  redirect("/me");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
