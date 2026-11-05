"use client";

import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn, RivetedCard, usePreferences } from "@loxrate/ui";
import { ranks } from "@/lib/content";

/**
 * Комната 05 «Лестница рангов» (ТЗ §8): горизонтальный коридор, пин на скролле.
 * При reduced-motion/выключенных эффектах — обычная горизонтальная прокрутка.
 */
export function RanksCorridor() {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { effects } = usePreferences();

  useEffect(() => {
    if (!effects || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sectionEl = section.current;
    const trackEl = track.current;
    if (!sectionEl || !trackEl) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const distance = (): number =>
        Math.max(0, trackEl.scrollWidth - window.innerWidth + 48);
      if (distance() <= 0) return;

      gsap.to(trackEl, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => context.revert();
  }, [effects]);

  return (
    <section
      ref={section}
      className="relative overflow-hidden border-y border-graphite/60 bg-basement/40"
    >
      <div className="mx-auto flex max-w-5xl items-end justify-between gap-6 px-6 pt-16">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-ember">
            05 · Лестница рангов
          </p>
          <h2 className="mt-3 font-heading text-4xl uppercase sm:text-6xl">
            Путь
          </h2>
        </div>
        <p className="max-w-[14rem] text-right font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.2em] text-steel">
          ранг — про дисциплину,
          <br />
          не про внешность
        </p>
      </div>

      <div
        className={cn(
          "mt-10 pb-16",
          effects ? "overflow-hidden" : "overflow-x-auto",
        )}
      >
        <div ref={track} className="flex w-max gap-4 px-6">
          {ranks.ranks
            .filter((rank) => rank.rank !== "R0")
            .map((rank) => (
              <RivetedCard
                key={rank.rank}
                label={rank.rank}
                number={`${rank.minXp.toLocaleString("ru-RU")} XP`}
                className="w-64 shrink-0"
              >
                <p className="font-heading text-3xl uppercase">{rank.name}</p>
                <ul className="mt-3 space-y-1 text-xs leading-relaxed text-steel">
                  {rank.perks.map((perk) => (
                    <li key={perk}>· {perk}</li>
                  ))}
                </ul>
              </RivetedCard>
            ))}

          <div className="flex w-64 shrink-0 flex-col justify-center border border-gold-apple/40 bg-[radial-gradient(circle_at_50%_30%,rgba(201,162,39,0.16),transparent_62%)] p-6">
            <img src="/assets/apple.svg" alt="" width={56} height={56} />
            <p className="mt-4 font-heading text-2xl uppercase text-gold-apple">
              Адам / Ева
            </p>
            <p className="mt-2 text-xs leading-relaxed text-steel">
              30 000 XP + одобрение админа
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
