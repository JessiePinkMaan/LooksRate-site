"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "../cn";
import { usePreferences } from "../effects";

export type HoldButtonProps = {
  children: ReactNode;
  onConfirm: () => void;
  durationMs?: number;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

/**
 * Ключевое действие удержанием (ТЗ §4.4). 0.8–1.2 с, с отменой при уходе.
 * При выключенных эффектах / reduced-motion — обычное нажатие.
 */
export function HoldButton({
  children,
  onConfirm,
  durationMs = 1000,
  disabled = false,
  className,
  ariaLabel,
}: HoldButtonProps) {
  const { effects } = usePreferences();
  const instant = !effects;
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(0);
  }, []);

  const begin = useCallback(() => {
    if (disabled) return;
    if (instant) {
      onConfirm();
      return;
    }

    cancel();
    firedRef.current = false;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - startRef.current) / durationMs);
      setProgress(ratio);

      if (ratio >= 1) {
        if (!firedRef.current) {
          firedRef.current = true;
          onConfirm();
        }
        rafRef.current = null;
        setProgress(0);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [cancel, disabled, durationMs, instant, onConfirm]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const holding = progress > 0;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      data-holding={holding ? "true" : "false"}
      className={cn(
        "relative overflow-hidden border border-graphite bg-concrete px-8 py-4",
        "font-mono text-[0.7rem] uppercase tracking-[0.28em] text-ash",
        "transition-colors hover:border-blood",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blood",
        "disabled:cursor-not-allowed disabled:opacity-40",
        holding && "border-blood",
        className,
      )}
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onConfirm();
        }
      }}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 z-0 bg-blood/10"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-blood"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </button>
  );
}
