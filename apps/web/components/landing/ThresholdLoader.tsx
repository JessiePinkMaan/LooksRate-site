"use client";

import { useEffect, useState } from "react";

import { HoldButton } from "@loxrate/ui";

import { microcopy } from "@/lib/content";

const STORAGE_KEY = "loxrate:entered";

/**
 * Комната 00 «Порог» (ТЗ §8): чёрный экран, контур яблока, 18+ и hold-вход.
 * Прогресс для простоты — таймер; позже привяжем к загрузке критичных ассетов.
 */
export function ThresholdLoader() {
  const [phase, setPhase] = useState<"loading" | "open" | "closing" | "done">(
    "loading",
  );
  const [progress, setProgress] = useState(0);
  const [age, setAge] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(STORAGE_KEY) === "1"
    ) {
      setPhase("done");
      return;
    }

    let value = 0;
    const timer = window.setInterval(() => {
      value = Math.min(1, value + 0.14);
      setProgress(value);
      if (value >= 1) {
        window.clearInterval(timer);
        setPhase((current) => (current === "loading" ? "open" : current));
      }
    }, 110);

    return () => window.clearInterval(timer);
  }, []);

  if (phase === "done") return null;

  const enter = (): void => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setPhase("closing");
    window.setTimeout(() => setPhase("done"), 600);
  };

  return (
    <div
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center gap-7 bg-void px-6 text-center transition-opacity duration-500 ${
        phase === "closing"
          ? "pointer-events-none opacity-0"
          : "opacity-100"
      }`}
    >
      <img
        src="/assets/apple-outline.svg"
        alt=""
        width={96}
        height={96}
        className="opacity-80"
      />
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        Порог
      </p>
      <h2 className="max-w-md font-heading text-4xl uppercase leading-[0.95] tracking-[0.02em]">
        Подвал открывается
      </h2>

      <div className="h-px w-44 overflow-hidden bg-graphite">
        <div
          className="h-px bg-blood transition-[width] duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-steel">
        {Math.round(progress * 100)}%
      </p>

      <label className="flex max-w-sm cursor-pointer items-start gap-3 text-left font-mono text-[0.65rem] leading-relaxed text-steel">
        <input
          type="checkbox"
          checked={age}
          onChange={(event) => setAge(event.target.checked)}
          className="mt-0.5 accent-[#b3121b]"
        />
        {microcopy.ageGate}
      </label>

      <HoldButton
        onConfirm={enter}
        disabled={!age || progress < 1}
        ariaLabel={microcopy.enter}
      >
        {microcopy.enter}
      </HoldButton>
    </div>
  );
}
