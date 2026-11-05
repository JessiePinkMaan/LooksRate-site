import "server-only";

import { resolve, sep } from "node:path";

/** Каталог загруженных видео (локальный fallback вместо S3/HLS). */
export function videosDir(): string {
  return process.env.STORAGE_DIR
    ? resolve(process.env.STORAGE_DIR)
    : resolve(process.cwd(), "../../storage/videos");
}

/** Безопасно резолвит storage_key внутри каталога (без path traversal). */
export function resolveStorageFile(storageKey: string): string | null {
  const dir = videosDir();
  const file = resolve(dir, storageKey);
  if (file !== dir && !file.startsWith(dir + sep)) return null;
  return file;
}
