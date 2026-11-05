"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { usePreferences } from "../effects";

/**
 * Кастомный курсор: красная точка + мягкое кольцо, которое становится
 * заметнее на интерактиве (ТЗ §4.4). Отключается на touch, при
 * reduced-motion и при выключенных эффектах.
 */
export function CustomCursor(): ReactNode {
  const { effects } = usePreferences();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!effects || typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let frame = 0;

    const onMove = (event: PointerEvent): void => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      const element = event.target as Element | null;
      const interactive = Boolean(element?.closest("a, button, [data-cursor]"));
      if (ringRef.current) {
        ringRef.current.dataset.active = interactive ? "true" : "false";
      }
    };

    const tick = (): void => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    document.documentElement.dataset.cursor = "on";

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      delete document.documentElement.dataset.cursor;
    };
  }, [effects]);

  if (!effects) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
