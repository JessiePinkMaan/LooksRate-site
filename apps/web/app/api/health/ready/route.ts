import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Readiness для балансировщика: проверяет, что приложение может дойти до БД.
 * Liveness остаётся на /api/health и не зависит от состояния базы.
 */
export async function GET(): Promise<NextResponse> {
  const started = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ready",
        service: "loxrate-web",
        checks: { database: "ok" },
        latencyMs: Date.now() - started,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        status: "not-ready",
        service: "loxrate-web",
        checks: { database: "error" },
        latencyMs: Date.now() - started,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
