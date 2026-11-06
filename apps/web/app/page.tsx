import type { Metadata } from "next";

import { RivetedCard } from "@loxrate/ui";

import { HeroApple } from "@/components/landing/HeroApple";
import { ManifestScroll } from "@/components/landing/ManifestScroll";
import { ThresholdGate } from "@/components/landing/ThresholdGate";
import { TLink } from "@/components/motion/TLink";
import { getSessionUser } from "@/lib/auth";
import { codex, slogans } from "@/lib/content";

export const metadata: Metadata = {
  title: "Подвал. Яблоко. Стоа.",
};

const rooms = [
  {
    n: "01",
    title: "Манифест",
    href: "/manifest",
    text: "Кто мы и семь правил подвала.",
  },
  {
    n: "02",
    title: "Основатели",
    href: "/founders",
    text: "",
  },
  {
    n: "03",
    title: "Лор",
    href: "/lore",
    text: "Глоссарий луксмаксинга: что безопасно, что спорно.",
  },
  {
    n: "04",
    title: "Ранги",
    href: "/ranks",
    text: "R0-R7: путь дисциплины и вклада.",
  },
  {
    n: "05",
    title: "Видео",
    href: "/vault",
    text: "Видео-хранилище клуба. Часть - по доступу.",
  },
  {
    n: "06",
    title: "Доступ",
    href: "/access",
    text: "Уровни T0-T4 и что внутри.",
  },
  {
    n: "07",
    title: "Зал",
    href: "/hall",
    text: "Топ по XP, идея месяца и признание клуба.",
  },
];

const CHANNEL = "https://t.me/loxrating";
const BOT = "https://t.me/loxrate_bot";
const CONTACT = "https://t.me/retawum";

export default async function HomePage() {
  const user = await getSessionUser();
  const [heroFirst, ...heroRest] = slogans.slogan.main.split(" ");
  const heroRestLine = heroRest.join(" ");

  return (
    <>
      <ThresholdGate initiallyEntered={Boolean(user)} />

      <main>
        <section className="relative flex min-h-[86svh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
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

          <HeroApple />

          <h1
            data-intro-title
            className="relative mt-6 pb-6 font-heading text-[clamp(3rem,14vw,12rem)] uppercase leading-none tracking-[0.01em] sm:pb-10"
          >
            <span className="block">{heroFirst}</span>
            <span className="mt-[0.14em] block -translate-x-2 sm:-translate-x-4">
              {heroRestLine}
            </span>
          </h1>

          <p
            data-intro-after
            className="relative mt-8 max-w-md text-pretty text-sm leading-relaxed text-steel"
          >
            Твой честный рейтинг и проводник в мир луксмаксинга. Смотри правде в
            лицо и работай над тем, что в твоей власти.
          </p>

          <div
            data-intro-after
            className="relative mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <TLink
              href="/vault"
              className="border border-blood bg-blood px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:bg-blood-deep"
            >
              Смотреть видео
            </TLink>
            <TLink
              href="/login"
              className="border border-graphite bg-concrete px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-blood"
            >
              Войти в Подвал
            </TLink>
          </div>
        </section>

        <ManifestScroll />

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-heading text-3xl uppercase">Комнаты</h2>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel">
              выбери дверь
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <TLink key={room.href} href={room.href} className="block">
                <RivetedCard label={room.n} number="→" className="h-full">
                  <p className="font-heading text-2xl uppercase">{room.title}</p>
                  {room.text ? (
                    <p className="mt-2 text-sm leading-relaxed text-steel">
                      {room.text}
                    </p>
                  ) : null}
                </RivetedCard>
              </TLink>
            ))}
          </div>

          <p className="mt-12 max-w-2xl font-display text-2xl italic leading-snug text-ash">
            «{codex.rules[0]?.text}»
          </p>
          <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-steel">
            Кодекс · правило 1
          </p>
        </section>
      </main>

      <footer className="border-t border-graphite px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6">
          <a
            href={CHANNEL}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
          >
            Telegram-канал
          </a>
          <a
            href={BOT}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
          >
            Бот
          </a>
          <a
            href={CONTACT}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
          >
            @retawum
          </a>

          <div className="ml-auto flex flex-wrap gap-4 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-steel">
            <TLink href="/settings">Настройки</TLink>
            <TLink href="/legal/rules">Правила</TLink>
            <TLink href="/legal/privacy">Приватность</TLink>
            <TLink href="/legal/terms">Оферта</TLink>
            <TLink href="/legal/18plus">18+</TLink>
          </div>

          <p className="w-full text-xs leading-relaxed text-steel">
            18+. Это игра и инструмент, а не диагноз и не приговор.
          </p>
        </div>
      </footer>
    </>
  );
}
