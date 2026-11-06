import { createWriteStream } from "node:fs";
import { mkdir, stat, unlink } from "node:fs/promises";
import { extname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isWorkersDeployment } from "@/lib/runtime";
import { resolveStorageFile, videosDir } from "@/lib/storage";

const MAX_BYTES = 512 * 1024 * 1024;
const ALLOWED_EXT = new Set([".mp4", ".webm", ".mov"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // На Workers нет постоянного диска: видео временно отключено.
  if (isWorkersDeployment) {
    return NextResponse.json(
      { error: "video storage is disabled on this deployment" },
      { status: 503 },
    );
  }

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too large" }, { status: 413 });
  }

  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "unsupported" }, { status: 415 });
  }

  const dir = videosDir();
  await mkdir(dir, { recursive: true });

  const storageKey = `${video.id}${ext}`;
  const filePath = resolveStorageFile(storageKey);
  if (!filePath) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }

  try {
    await pipeline(
      Readable.fromWeb(
        file.stream() as unknown as import("node:stream/web").ReadableStream,
      ),
      createWriteStream(filePath),
    );
  } catch {
    await unlink(filePath).catch(() => undefined);
    return NextResponse.json(
      { error: "write failed" },
      { status: 500 },
    );
  }

  const written = await stat(filePath);
  if (written.size !== file.size) {
    await unlink(filePath).catch(() => undefined);
    return NextResponse.json({ error: "size mismatch" }, { status: 500 });
  }

  await prisma.videoAsset.deleteMany({
    where: { videoId: id, kind: "ORIGINAL" },
  });
  await prisma.videoAsset.create({
    data: {
      videoId: id,
      kind: "ORIGINAL",
      storageKey,
      size: written.size,
    },
  });
  await prisma.video.update({
    where: { id },
    data: { status: "READY", publishAt: video.publishAt ?? new Date() },
  });
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      actorRole: user.role,
      action: "video.upload",
      entityType: "video",
      entityId: id,
      afterJson: { storageKey, size: written.size },
    },
  });

  return NextResponse.redirect(new URL("/admin/videos", request.url), {
    status: 303,
  });
}
