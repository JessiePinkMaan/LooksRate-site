"use server";

import { redirect } from "next/navigation";

import { createSession, destroySession } from "./auth";
import { prisma } from "./db";

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
