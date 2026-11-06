"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { Prisma } from "@loxrate/db";

import { createSession, destroySession } from "./auth";
import { entry } from "./content";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./password";
import { checkRateLimit, clearRateLimit } from "./rate-limit";

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

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

/** Фиктивный scrypt-хеш: выравнивает время ответа для несуществующих логинов. */
const DUMMY_PASSWORD_HASH =
  "scrypt$0123456789abcdef0123456789abcdef$9564d5a180593f4f60ac8b2db7e8966b37a1d6fc22b396d69f4f71972c1820f80cec190209c19b5603fae554eee5a6318a4cadcbc5b3892fd40e2d8df24c3997";

async function clientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || store.get("x-real-ip") || "local";
}

function rateLimitError(): AuthState {
  return { error: entry.form.errorRateLimit };
}

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

  const ip = await clientIp();
  if (!checkRateLimit(`register:${ip}`, 5, REGISTER_WINDOW_MS).allowed) {
    return rateLimitError();
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
  const ip = await clientIp();
  const accountKey = `login:account:${username}`;

  const accountLimit = checkRateLimit(
    accountKey,
    6,
    LOGIN_WINDOW_MS,
  );
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 25, LOGIN_WINDOW_MS);
  if (!accountLimit.allowed || !ipLimit.allowed) {
    return rateLimitError();
  }

  const user = await prisma.user.findFirst({ where: { username } });

  if (!user?.passwordHash) {
    verifyPassword(parsed.data.password, DUMMY_PASSWORD_HASH);
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

  clearRateLimit(accountKey);
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
