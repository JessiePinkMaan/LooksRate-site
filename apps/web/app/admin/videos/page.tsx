import { prisma } from "@/lib/db";

import {
  createVideoAction,
  deleteVideoAction,
  toggleVideoAction,
} from "../actions";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full border border-graphite bg-void px-3 py-2 text-sm text-ash outline-none focus:border-ember";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const videos = await prisma.video.findMany({
    include: {
      accessRules: true,
      assets: { where: { kind: "ORIGINAL" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <form
        action={createVideoAction}
        className="grid gap-3 border border-graphite bg-concrete p-5 sm:grid-cols-2"
      >
        <h2 className="font-heading text-2xl uppercase sm:col-span-2">
          Добавить видео
        </h2>

        {error ? (
          <p className="border border-blood/40 bg-blood/5 px-3 py-2 text-xs text-ember sm:col-span-2">
            {error === "validation"
              ? "Проверь поля: название ≥2 символов, slug — a-z/0-9/дефис."
              : "Не удалось сохранить видео (возможно, slug уже занят)."}
          </p>
        ) : null}

        <label className="text-xs text-steel">
          Название
          <input name="title" required minLength={2} className={inputClass} />
        </label>
        <label className="text-xs text-steel">
          Slug
          <input
            name="slug"
            required
            placeholder="novoe-video"
            className={inputClass}
          />
        </label>
        <label className="text-xs text-steel sm:col-span-2">
          Описание
          <textarea name="description" rows={2} className={inputClass} />
        </label>
        <label className="text-xs text-steel">
          Доступ
          <select name="accessType" className={inputClass} defaultValue="AUTH">
            <option value="PUBLIC">PUBLIC — всем</option>
            <option value="AUTH">AUTH — после входа</option>
            <option value="RANK">RANK — по рангу</option>
            <option value="TIER">TIER — по тарифу</option>
            <option value="RANK_AND_TIER">RANK_AND_TIER — ранг + тариф</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-steel">
            Мин. ранг
            <select name="minRank" className={inputClass} defaultValue="R3">
              {["R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7"].map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-steel">
            Мин. тариф
            <select name="minTier" className={inputClass} defaultValue="T2">
              {["T0", "T1", "T2", "T3", "T4"].map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="border border-blood bg-blood px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:bg-blood-deep sm:col-span-2"
        >
          Добавить видео
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="font-heading text-2xl uppercase">
          Все видео ({videos.length})
        </h2>
        {videos.length === 0 ? (
          <p className="text-sm text-steel">Пока пусто.</p>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-wrap items-center gap-3 border border-graphite bg-concrete p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg uppercase">{video.title}</p>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-steel">
                  /{video.slug} · {video.status} ·{" "}
                  {video.publishAt ? "опубликовано" : "черновик"} ·{" "}
                  {video.accessRules.map((rule) => rule.type).join(", ") ||
                    "PUBLIC"}{" "}
                  · {video.assets.length > 0 ? "файл загружен" : "файла нет"}
                </p>
              </div>
              <form
                action={`/api/admin/videos/${video.id}/file`}
                method="post"
                encType="multipart/form-data"
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="file"
                  name="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  required
                  className="max-w-[13rem] text-[0.65rem] text-steel"
                />
                <button
                  type="submit"
                  className="border border-graphite px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
                >
                  Загрузить
                </button>
              </form>
              <form action={toggleVideoAction}>
                <input type="hidden" name="id" value={video.id} />
                <button
                  type="submit"
                  className="border border-graphite px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
                >
                  {video.publishAt ? "Снять" : "Опубликовать"}
                </button>
              </form>
              <form action={deleteVideoAction}>
                <input type="hidden" name="id" value={video.id} />
                <button
                  type="submit"
                  className="border border-graphite px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ember transition-colors hover:border-ember"
                >
                  Удалить
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
