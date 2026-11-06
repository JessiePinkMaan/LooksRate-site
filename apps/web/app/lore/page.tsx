import type { Metadata } from "next";

import { RivetedCard } from "@loxrate/ui";

import { TLink } from "@/components/motion/TLink";
import { glossary } from "@/lib/content";

export const metadata: Metadata = {
  title: "Лор",
};

const safetyLabel: Record<string, string> = {
  SAFE: "безопасно",
  CAUTION: "спорно",
  DANGER: "опасно",
};

export default function LorePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-16">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
          /lore
        </p>
        <TLink
          href="/"
          className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
        >
          ← на порог
        </TLink>
      </div>

      <h1 className="mt-5 font-heading text-5xl uppercase leading-[0.9] sm:text-7xl">
        Лор
      </h1>

      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-steel">
        Глоссарий луксмаксинга: честно, своими словами, с пометкой безопасности.
        Уровень - глубина «айсберга»: от безобидного к тёмному.
      </p>

      <div className="mt-6 border border-blood/40 bg-blood/5 p-5">
        <p className="font-heading text-lg uppercase text-ember">Цена</p>
        <p className="mt-2 text-sm leading-relaxed text-steel">
          Опасные практики (боунсмэшинг, препараты, голодание, самоповреждение)
          здесь не описываются как инструкции. Если тебе тяжело - обратись к
          врачу или специалисту по психическому здоровью.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {glossary.terms.map((term) => (
          <RivetedCard
            key={term.slug}
            label={`уровень ${term.level}`}
            number={safetyLabel[term.safety] ?? term.safety}
          >
            <p className="font-heading text-2xl uppercase">{term.term}</p>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              {term.definition}
            </p>
            {term.origin ? (
              <p className="mt-3 text-xs leading-relaxed text-steel">
                <span className="text-ash">Откуда: </span>
                {term.origin}
              </p>
            ) : null}
            {term.science ? (
              <p className="mt-1 text-xs leading-relaxed text-steel">
                <span className="text-ash">Наука: </span>
                {term.science}
              </p>
            ) : null}
            {term.loxrateTake ? (
              <p className="mt-1 text-xs leading-relaxed text-steel">
                <span className="text-ash">LoxRate: </span>
                {term.loxrateTake}
              </p>
            ) : null}
          </RivetedCard>
        ))}
      </div>
    </main>
  );
}
