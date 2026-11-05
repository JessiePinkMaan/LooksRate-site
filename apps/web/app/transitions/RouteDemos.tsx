"use client";

import { useTransition } from "@/components/motion/TransitionProvider";
import type { CurtainType } from "@/components/motion/curtain";

const items: Array<{ type: CurtainType; name: string; note: string }> = [
  { type: 1, name: "T1 · Трещина", note: "шумный фронт от точки клика" },
  { type: 2, name: "T2 · Люк", note: "радиальная диафрагма" },
  { type: 3, name: "T3 · Падение яблока", note: "красная волна" },
  { type: 6, name: "T6 · Плёнка", note: "сдвиг кадра + зерно + cue mark" },
  { type: 9, name: "T9 · Глитч-шов", note: "горизонтальные полосы + RGB" },
];

export function RouteDemos() {
  const { demo, isTransitioning } = useTransition();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.type}
          type="button"
          disabled={isTransitioning}
          onClick={() => demo(item.type)}
          className="group flex flex-col items-start gap-2 border border-graphite bg-concrete px-5 py-4 text-left transition-colors hover:border-blood disabled:opacity-40"
        >
          <span className="font-heading text-xl uppercase tracking-[0.04em] transition-colors group-hover:text-ash">
            {item.name}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel">
            {item.note}
          </span>
        </button>
      ))}
    </div>
  );
}
