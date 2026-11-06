"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePreferences } from "@loxrate/ui";

export type ScrollTransitionKind =
  | "film"
  | "fold"
  | "tunnel"
  | "chains"
  | "iris";

/**
 * Скролл-переходы (класс A, ТЗ §6.3/§6.5). При reduced-motion/выключенных
 * эффектах блок остаётся статичным - контент полностью доступен.
 */
export function ScrollTransition({
  kind,
  children,
  className,
}: {
  kind: ScrollTransitionKind;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { effects } = usePreferences();

  useEffect(() => {
    if (!effects || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const element = ref.current;
    if (!element) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const trigger = {
        trigger: element,
        start: "top 88%",
        end: "top 38%",
        scrub: true,
      };

      if (kind === "film") {
        gsap.fromTo(
          element,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", ease: "none", scrollTrigger: trigger },
        );
      } else if (kind === "fold") {
        gsap.fromTo(
          element,
          { rotateY: 42, transformPerspective: 1200 },
          {
            rotateY: 0,
            ease: "none",
            scrollTrigger: trigger,
          },
        );
      } else if (kind === "tunnel") {
        gsap.fromTo(
          element,
          { scale: 1.3, filter: "blur(8px)" },
          {
            scale: 1,
            filter: "blur(0px)",
            ease: "none",
            scrollTrigger: trigger,
          },
        );
      } else if (kind === "chains") {
        gsap.fromTo(
          element,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: trigger,
          },
        );
      } else {
        gsap.fromTo(
          element,
          { clipPath: "circle(0% at 50% 40%)" },
          {
            clipPath: "circle(75% at 50% 40%)",
            ease: "none",
            scrollTrigger: trigger,
          },
        );
      }
    }, ref);

    return () => context.revert();
  }, [effects, kind]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
