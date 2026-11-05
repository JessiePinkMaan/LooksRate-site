import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";

import { decideAccess } from "@/lib/access";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveStorageFile } from "@/lib/storage";

function contentTypeFor(storageKey: string): string {
  if (storageKey.endsWith(".webm")) return "video/webm";
  if (storageKey.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: { accessRules: true },
  });
  if (!video) return new Response("Not found", { status: 404 });

  const user = await getSessionUser();
  const subscriptions = user
    ? await prisma.subscription.findMany({
        where: { userId: user.id },
        include: { tier: true },
      })
    : [];
  const decision = decideAccess(user, video, subscriptions);
  if (!decision.allowed) return new Response("Forbidden", { status: 403 });

  const asset = await prisma.videoAsset.findFirst({
    where: { videoId: id, kind: "ORIGINAL" },
  });
  if (!asset) return new Response("No file", { status: 404 });

  const filePath = resolveStorageFile(asset.storageKey);
  if (!filePath) return new Response("Bad path", { status: 400 });

  let size: number;
  try {
    size = statSync(filePath).size;
  } catch {
    return new Response("No file", { status: 404 });
  }
  if (size === 0) return new Response("Empty file", { status: 404 });

  const contentType = contentTypeFor(asset.storageKey);
  const range = request.headers.get("range");

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (!match) {
      return new Response("Bad range", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2]
      ? Math.min(Number(match[2]), size - 1)
      : size - 1;

    if (start >= size || start > end) {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const stream = createReadStream(filePath, { start, end });
    return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store",
      },
    });
  }

  const stream = createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
    },
  });
}
