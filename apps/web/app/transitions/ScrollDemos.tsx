"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePreferences } from "@loxrate/ui";

/**
 * Скролл-переходы (класс A, ТЗ §6.5): T4, T5, T7, T8.
 * При reduced-motion/выключенных эффектах - статичные финальные состояния.
 */
export function ScrollDemos() {
  const root = useRef<HTMLDivElement>(null);
  const t4 = useRef<HTMLDivElement>(null);
  const t5 = useRef<HTMLDivElement>(null);
  const t7 = useRef<HTMLDivElement>(null);
  const t8 = useRef<HTMLDivElement>(null);
  const { effects } = usePreferences();

  useEffect(() => {
    if (!effects || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      if (t4.current) {
        gsap.fromTo(
          t4.current,
          { rotateY: 62, opacity: 0.35 },
          {
            rotateY: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: t4.current,
              start: "top 85%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      }

      if (t5.current) {
        gsap.fromTo(
          t5.current,
          { scale: 1.6, opacity: 0.15, filter: "blur(10px)" },
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            scrollTrigger: {
              trigger: t5.current,
              start: "top 85%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      }

      if (t7.current) {
        gsap.fromTo(
          t7.current,
          { rotate: 180 },
          {
            rotate: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: t7.current, start: "top 85%" },
          },
        );
      }

      if (t8.current) {
        gsap.fromTo(
          t8.current,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: t8.current,
              start: "top 85%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      }
    }, root);

    return () => context.revert();
  }, [effects]);

  return (
    <div ref={root} className="space-y-8">
      <div className="[perspective:1200px]">
        <div
          ref={t4}
          className="origin-left border border-graphite bg-concrete p-8 [transform-style:preserve-3d]"
        >
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember">
            T4 · класс A
          </p>
          <p className="mt-2 font-heading text-3xl uppercase">
            Зеркальный излом
          </p>
          <p className="mt-2 text-sm text-steel">
            Экран складывается по вертикальной оси и открывает новую сцену.
          </p>
        </div>
      </div>

      <div
        ref={t5}
        className="border border-graphite bg-concrete p-8 [transform-origin:center]"
      >
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember">
          T5 · класс A
        </p>
        <p className="mt-2 font-heading text-3xl uppercase">Туннель</p>
        <p className="mt-2 text-sm text-steel">
          Камера пролетает сквозь раму: Z-зум и радиальное размытие.
        </p>
      </div>

      <div
        ref={t7}
        className="border border-graphite bg-concrete p-8"
      >
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember">
          T7 · onEnter
        </p>
        <p className="mt-2 font-heading text-3xl uppercase">Опрокидывание</p>
        <p className="mt-2 text-sm text-steel">
          Сцена переворачивается на 180° и встаёт на место. Скролл не
          инвертируется.
        </p>
      </div>

      <div
        ref={t8}
        className="border border-graphite bg-concrete p-8"
      >
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember">
          T8 · класс A
        </p>
        <p className="mt-2 font-heading text-3xl uppercase">Цепи</p>
        <p className="mt-2 text-sm text-steel">
          Горизонтальные цепи стягивают старую сцену (clip-path wipe).
        </p>
      </div>
    </div>
  );
}
