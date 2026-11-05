import type { Metadata } from "next";

import { BeltDivider } from "@loxrate/ui";

import { Reveal } from "@/components/landing/Reveal";
import { TLink } from "@/components/motion/TLink";
import { codex, manifest } from "@/lib/content";

export const metadata: Metadata = {
  title: "Манифест",
};

export default function ManifestPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-28 pt-16">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
          /manifest
        </p>
        <TLink
          href="/"
          className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
        >
          ← на порог
        </TLink>
      </div>

      <h1 className="mt-5 font-heading text-5xl uppercase leading-[0.9] sm:text-7xl">
        Манифест
      </h1>

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

      <h2 className="font-heading text-3xl uppercase">{codex.title}</h2>
      <ol className="mt-6 space-y-4">
        {codex.rules.map((rule) => (
          <li
            key={rule.n}
            className="flex gap-4 border-b border-graphite/60 pb-4"
          >
            <span className="shrink-0 font-mono text-xs tracking-[0.2em] text-blood">
              № {String(rule.n).padStart(3, "0")}
            </span>
            <span className="font-heading text-lg uppercase leading-tight">
              {rule.text}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
