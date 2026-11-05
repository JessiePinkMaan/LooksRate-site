"use client";

import { cn } from "../cn";
import { setPreferences, usePreferences } from "../effects";

/** Глобальная кнопка «Отключить эффекты» (ТЗ §18). */
export function EffectsToggle({ className }: { className?: string }) {
  const { effects } = usePreferences();

  return (
    <button
      type="button"
      onClick={() => setPreferences({ effects: !effects })}
      aria-pressed={effects}
      className={cn(
        "border border-graphite bg-basement/80 px-3 py-2",
        "font-mono text-[0.6rem] uppercase tracking-[0.25em] text-steel",
        "backdrop-blur transition-colors hover:text-ash",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blood",
        className,
      )}
    >
      {effects ? "Эффекты: вкл" : "Эффекты: выкл"}
    </button>
  );
}
