import type { Metadata } from "next";

import { RivetedCard } from "@loxrate/ui";

import { TLink } from "@/components/motion/TLink";
import { ranks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ранги",
};

export default function RanksPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-16">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
          /ranks
        </p>
        <TLink
          href="/"
          className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
        >
          ← на порог
        </TLink>
      </div>

      <h1 className="mt-5 font-heading text-5xl uppercase leading-[0.9] sm:text-7xl">
        Лестница рангов
      </h1>

      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-steel">
        Ранг отражает дисциплину и вклад, а не внешность. Это игра и инструмент,
        а не диагноз и не приговор.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ranks.ranks.map((rank) => (
          <RivetedCard
            key={rank.rank}
            label={rank.rank}
            number={`${rank.minXp.toLocaleString("ru-RU")} XP`}
          >
            <p className="font-heading text-3xl uppercase">{rank.name}</p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-steel">
              {rank.perks.map((perk) => (
                <li key={perk}>· {perk}</li>
              ))}
            </ul>
          </RivetedCard>
        ))}
      </div>

      <p className="mt-8 font-mono text-xs text-steel">
        Формула порогов: {ranks.formula}. Редактируется в админке.
      </p>

      <div className="mt-8">
        <TLink
          href="/access"
          className="inline-block border border-graphite px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
        >
          Уровни доступа →
        </TLink>
      </div>
    </main>
  );
}
