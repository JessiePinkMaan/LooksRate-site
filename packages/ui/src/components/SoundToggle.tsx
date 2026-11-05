"use client";

import { cn } from "../cn";
import { setPreferences, usePreferences } from "../effects";

/**
 * Тумблер звука. По умолчанию выключен, автоплея нет (ТЗ §4.5).
 * Сами звуки подключаются в Фазе 2/3.
 */
export function SoundToggle({ className }: { className?: string }) {
  const { sound } = usePreferences();

  return (
    <button
      type="button"
      onClick={() => setPreferences({ sound: !sound })}
      aria-pressed={sound}
      className={cn(
        "border border-graphite bg-basement/80 px-3 py-2",
        "font-mono text-[0.6rem] uppercase tracking-[0.25em] text-steel",
        "backdrop-blur transition-colors hover:text-ash",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blood",
        className,
      )}
    >
      {sound ? "Звук: вкл" : "Звук: выкл"}
    </button>
  );
}
