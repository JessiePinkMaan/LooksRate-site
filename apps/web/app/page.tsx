import type { Metadata } from "next";

import { BeltDivider, cn, RivetedCard } from "@loxrate/ui";

import { Reveal } from "@/components/landing/Reveal";
import { RanksCorridor } from "@/components/landing/RanksCorridor";
import { ScrollTransition } from "@/components/landing/ScrollTransition";
import { ThresholdLoader } from "@/components/landing/ThresholdLoader";
import { TLink } from "@/components/motion/TLink";
import {
  codex,
  feed,
  glossary,
  manifest,
  microcopy,
  slogans,
  vaultPreview,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Подвал. Яблоко. Стоа.",
};

const CHANNEL = "https://t.me/loxrating";
const BOT = "https://t.me/loxrate_bot";
const CONTACT = "https://t.me/retawum";

const whatCards = [
  {
    label: "Оценка",
    title: "Честно",
    text: "Оценка лица или тела в боте. Без иллюзий и без «ты и так красивый».",
  },
  {
    label: "Баттл",
    title: "Баттл",
    text: "Сравни себя с другом или знаменитостью. Игра, а не приговор.",
  },
  {
    label: "Анкета",
    title: "Коммьюнити",
    text: "Стань частью клуба через анкету и могг-баттлы.",
  },
];

const navItems = [
  ["01", "hero"],
  ["02", "manifest"],
  ["03", "what"],
  ["04", "lore"],
  ["05", "ranks"],
  ["06", "vault"],
  ["08", "exit"],
] as const;

export default function HomePage() {
  const [heroFirst, ...heroRest] = slogans.slogan.main.split(" ");
  const heroRestLine = heroRest.join(" ");

  return (
    <>
      <ThresholdLoader />

      <nav
        aria-label="Комнаты"
        className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
      >
        {navItems.map(([number, anchor]) => (
          <a
            key={anchor}
            href={`#${anchor}`}
            className="group flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.2em] text-steel/60 transition-colors hover:text-ash"
          >
            <span className="h-px w-4 bg-steel/40 transition-all group-hover:w-6 group-hover:bg-blood" />
            {number}
          </a>
        ))}
      </nav>

      <main>
        {/* 01 · Hero */}
        <section
          id="hero"
          className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(201,162,39,0.12),transparent_46%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_62%,rgba(179,18,27,0.10),transparent_52%)]"
          />

          <p className="relative font-mono text-[0.6rem] uppercase tracking-[0.5em] text-steel">
            LoxRate · луксмаксинг и ментальность
          </p>

          <img
            src="/assets/apple-photo.webp"
            alt="Яблоко LoxRate"
            width={132}
            height={137}
            className="apple-float relative mt-8 drop-shadow-[0_0_60px_rgba(179,18,27,0.35)]"
          />

          <h1 className="relative mt-6 font-heading text-[clamp(3rem,14vw,12rem)] uppercase leading-[0.82] tracking-[0.01em]">
            <span className="block">{heroFirst}</span>
            <span className="block -translate-x-2 sm:-translate-x-4">
              {heroRestLine}
            </span>
          </h1>

          <p className="relative mt-8 max-w-md text-pretty text-sm leading-relaxed text-steel">
            Твой честный рейтинг и проводник в мир луксмаксинга. Смотри правде в
            лицо и работай над тем, что в твоей власти.
          </p>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={CHANNEL}
              target="_blank"
              rel="noreferrer noopener"
              className="border border-graphite bg-concrete px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
            >
              В Telegram
            </a>
            <TLink
              href="/manifest"
              transitionType={3}
              className="border border-blood bg-blood px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:bg-blood-deep"
            >
              Войти в Подвал
            </TLink>
          </div>

          <p className="relative mt-10 font-mono text-[0.55rem] uppercase tracking-[0.35em] text-steel/60">
            {microcopy.cookie}
          </p>
        </section>

        {/* 02 · Манифест + Кодекс */}
        <ScrollTransition kind="film">
          <section
            id="manifest"
            className="relative border-t border-graphite/60 px-6 py-24"
          >
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-blood">
                02 · Манифест
              </p>
              <h2 className="mt-3 font-heading text-4xl uppercase leading-[0.95] sm:text-6xl">
                Не удобный.
                <br />
                Не фон.
              </h2>

              <div className="mt-12 space-y-6">
                {manifest.paragraphs.map((paragraph, index) => (
                  <Reveal key={paragraph} delay={index * 70}>
                    <p className="font-display text-2xl leading-snug text-ash sm:text-3xl">
                      {paragraph}
                    </p>
                  </Reveal>
                ))}
              </div>

              <BeltDivider className="my-12" />

              <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-steel">
                {codex.title}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {codex.rules.map((rule) => (
                  <div
                    key={rule.n}
                    className="border border-graphite bg-concrete/60 p-4"
                  >
                    <p className="font-mono text-[0.6rem] tracking-[0.25em] text-blood">
                      № {String(rule.n).padStart(3, "0")}
                    </p>
                    <p className="mt-2 font-heading text-base uppercase leading-tight tracking-[0.02em]">
                      {rule.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollTransition>

        {/* 03 · Что такое LoxRate */}
        <ScrollTransition kind="fold">
          <section
            id="what"
            className="relative border-t border-graphite/60 px-6 py-24"
          >
            <div className="mx-auto max-w-5xl">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-blood">
                03 · Что такое LoxRate
              </p>
              <h2 className="mt-3 font-heading text-4xl uppercase sm:text-6xl">
                Три двери
              </h2>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {whatCards.map((card, index) => (
                  <RivetedCard
                    key={card.label}
                    label={card.label}
                    number={String(index + 1).padStart(2, "0")}
                  >
                    <p className="font-heading text-3xl uppercase">
                      {card.title}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-steel">
                      {card.text}
                    </p>
                  </RivetedCard>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={BOT}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="border border-graphite bg-concrete px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
                >
                  Открыть @loxrate_bot
                </a>
                <TLink
                  href="/ranks"
                  className="border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
                >
                  Лестница рангов
                </TLink>
              </div>
            </div>
          </section>
        </ScrollTransition>

        {/* 04 · Лор / Айсберг (превью) */}
        <ScrollTransition kind="tunnel">
          <section
            id="lore"
            className="relative border-t border-graphite/60 bg-[linear-gradient(to_bottom,#0a0a0b,#030303)] px-6 py-24"
          >
            <div className="mx-auto max-w-5xl">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-blood">
                04 · Лор / Айсберг
              </p>
              <h2 className="mt-3 font-heading text-4xl uppercase sm:text-6xl">
                Спуск вглубь
              </h2>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {glossary.terms.slice(0, 4).map((term) => (
                  <RivetedCard
                    key={term.slug}
                    label={`уровень ${term.level}`}
                    number={term.safety}
                  >
                    <p className="font-heading text-2xl uppercase">
                      {term.term}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-steel">
                      {term.definition}
                    </p>
                  </RivetedCard>
                ))}
              </div>

              <div className="mt-8">
                <TLink
                  href="/lore"
                  className="inline-block border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
                >
                  Читать глоссарий
                </TLink>
              </div>
            </div>
          </section>
        </ScrollTransition>

        {/* 05 · Лестница рангов */}
        <div id="ranks">
          <RanksCorridor />
        </div>

        {/* 06 · Vault (превью) */}
        <ScrollTransition kind="chains">
          <section
            id="vault"
            className="relative border-t border-graphite/60 px-6 py-24"
          >
            <div className="mx-auto max-w-5xl">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-blood">
                06 · Vault
              </p>
              <h2 className="mt-3 font-heading text-4xl uppercase sm:text-6xl">
                Хранилище
              </h2>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vaultPreview.videos.map((video) => (
                  <div
                    key={video.slug}
                    className="group border border-graphite bg-concrete"
                  >
                    <div
                      className={cn(
                        "relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#1c1c20,#0a0a0b)]",
                        video.locked && "blur-[1.5px]",
                      )}
                    >
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(179,18,27,0.18),transparent_60%)]" />
                      {video.locked && (
                        <img
                          src="/assets/lock.svg"
                          alt="Закрыто"
                          width={22}
                          height={22}
                          className="absolute right-3 top-3"
                        />
                      )}
                      <span className="absolute bottom-2 right-3 font-mono text-[0.6rem] text-steel">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-heading text-lg uppercase">
                        {video.title}
                      </p>
                      <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
                        {video.access} · {video.locked ? "нужен ключ" : "открыто"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <TLink
                  href="/access"
                  transitionType={2}
                  className="inline-block border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
                >
                  Получить ключ
                </TLink>
              </div>
            </div>
          </section>
        </ScrollTransition>

        {/* 08 · Footer «Выход» */}
        <footer
          id="exit"
          className="relative border-t border-graphite px-6 py-16"
        >
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-blood">
              08 · Выход
            </p>

            <div className="mt-8 grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="font-heading text-3xl uppercase">Telegram</h2>
                <ul className="mt-4 space-y-3">
                  {feed.posts.slice(0, 3).map((post) => (
                    <li
                      key={post.id}
                      className="border border-graphite bg-concrete/60 p-4"
                    >
                      <p className="text-sm leading-relaxed text-ash">
                        {post.text}
                      </p>
                      <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
                        {new Date(post.date).toLocaleDateString("ru-RU")} ·{" "}
                        {post.views} просмотров
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <a
                  href={CHANNEL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block border border-graphite px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
                >
                  Канал
                </a>
                <a
                  href={BOT}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block border border-graphite px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
                >
                  Бот
                </a>
                <a
                  href={CONTACT}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block border border-graphite px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
                >
                  @retawum
                </a>

                <div className="flex flex-wrap gap-4 pt-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
                  <TLink href="/legal/rules">Правила</TLink>
                  <TLink href="/legal/privacy">Приватность</TLink>
                  <TLink href="/legal/terms">Оферта</TLink>
                  <TLink href="/legal/18plus">18+</TLink>
                </div>

                <p className="max-w-sm text-xs leading-relaxed text-steel">
                  18+. Это игра и инструмент, а не диагноз и не приговор. Мы не
                  даём медицинских рекомендаций. Если тебе плохо из-за внешности —
                  обратись к специалисту.
                </p>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <span className="h-px flex-1 bg-blood/60" />
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.4em] text-steel">
                выход
              </span>
              <span className="h-px flex-1 bg-blood/60" />
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
