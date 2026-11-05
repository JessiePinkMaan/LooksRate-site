import type { Metadata } from "next";

import { BeltDivider, RivetedCard } from "@loxrate/ui";

import { TLink } from "@/components/motion/TLink";
import { faq, tiers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Доступ",
};

export default function AccessPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-16">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
          /access
        </p>
        <TLink
          href="/"
          className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
        >
          ← на порог
        </TLink>
      </div>

      <h1 className="mt-5 font-heading text-5xl uppercase leading-[0.9] sm:text-7xl">
        Уровни доступа
      </h1>

      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-steel">
        Тарифы T0–T4. На старте цены скрыты — показывается «Скоро». Оплата и
        ручная выдача появятся позже.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiers.tiers.map((tier) => (
          <RivetedCard key={tier.key} label={tier.key} number="скоро">
            <p className="font-heading text-2xl uppercase">{tier.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              {tier.description}
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-steel">
              {tier.perks.map((perk) => (
                <li key={perk}>· {perk}</li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-blood">
              Цена: скоро
            </p>
          </RivetedCard>
        ))}
      </div>

      <BeltDivider className="my-12" />

      <h2 className="font-heading text-3xl uppercase">FAQ</h2>
      <div className="mt-6 space-y-5">
        {faq.faq.map((item) => (
          <div key={item.q} className="border-b border-graphite/60 pb-5">
            <p className="font-heading text-lg uppercase">{item.q}</p>
            <p className="mt-2 text-sm leading-relaxed text-steel">{item.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
