"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { usePreferences } from "@loxrate/ui";

import { setLenis } from "./scroll";

/**
 * Плавный скролл Lenis + синхронизация с GSAP ScrollTrigger (ТЗ §6.1).
 * GSAP/Lenis грузятся лениво, чтобы не раздувать начальный JS (ТЗ §18).
 * При reduced-motion / выключенных эффектах остаётся нативный скролл.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const { effects } = usePreferences();

  useEffect(() => {
    if (!effects || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    void (async () => {
      const [{ gsap }, { default: Lenis }, { ScrollTrigger }] = await Promise.all(
        [import("gsap"), import("lenis"), import("gsap/ScrollTrigger")],
      );
      if (cancelled) return;

      const lenis = new Lenis({ duration: 1.1 });
      setLenis(lenis);

      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number): void => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [effects]);

  return <>{children}</>;
}
