import type { Metadata } from "next";

import { FoundersScene } from "@/components/landing/FoundersScene";

export const metadata: Metadata = {
  title: "Основатели",
};

export default function FoundersPage() {
  return (
    <main>
      <div className="mx-auto max-w-5xl px-6 pb-4 pt-12">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
          /founders
        </p>
        <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.9] sm:text-7xl">
          Основатели
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
          Двое в свете лампы. Листай — цитаты появляются по одной; клик по фигуре
          открывает досье.
        </p>
      </div>
      <FoundersScene />
    </main>
  );
}
