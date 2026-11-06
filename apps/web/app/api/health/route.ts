import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness-эндпоинт для Docker/мониторинга. */
export function GET(): NextResponse {
  return NextResponse.json(
    {
      status: "ok",
      service: "loxrate-web",
      time: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
