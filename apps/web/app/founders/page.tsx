import type { Metadata } from "next";

import { FoundersScene } from "@/components/landing/FoundersScene";

export const metadata: Metadata = {
  title: "Основатели",
};

export default function FoundersPage() {
  return (
    <main>
      <div className="relative overflow-hidden border-b border-graphite/40">
        <div className="founders-hands" aria-hidden>
          <img
            src="/assets/hand-a.webp"
            alt=""
            className="founders-hand founders-hand-left"
          />
          <img
            src="/assets/hand-b.webp"
            alt=""
            className="founders-hand founders-hand-right"
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-10 pt-16">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
            /founders
          </p>
          <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.9] sm:text-7xl">
            Основатели
          </h1>
        </div>
      </div>
      <FoundersScene />
    </main>
  );
}
