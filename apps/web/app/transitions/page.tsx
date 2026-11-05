import type { Metadata } from "next";

import { BeltDivider } from "@loxrate/ui";

import { TLink } from "@/components/motion/TLink";

import { RouteDemos } from "./RouteDemos";
import { ScrollDemos } from "./ScrollDemos";

export const metadata: Metadata = {
  title: "Движок движения",
};

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-4">
      <span className="font-mono text-xs text-ember">{n}</span>
      <h2 className="font-heading text-2xl uppercase tracking-[0.06em]">
        {title}
      </h2>
      <span className="h-px flex-1 bg-graphite" />
    </div>
  );
}

export default function TransitionsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-14">
      <header className="mb-16 max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
            /_transitions · phase 2
          </p>
          <TLink
            href="/"
            className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
          >
            ← на порог
          </TLink>
        </div>
        <h1 className="mt-5 font-heading text-6xl uppercase leading-[0.9] tracking-[0.02em] sm:text-8xl">
          Движок движения
        </h1>
        <p className="mt-5 text-pretty text-sm leading-relaxed text-steel">
          Lenis + GSAP ScrollTrigger, занавес переходов на OGL и все девять
          эффектов. Роут-переходы запускаются кнопками, скролл-переходы — при
          прокрутке ниже.
        </p>
      </header>

      <section className="mb-16">
        <SectionTitle n="A" title="Роут-переходы (класс B)" />
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-steel">
          Cover → router.push → готовность маршрута → scrollTo(0) → reveal.
          Сторожевой таймер — 4 с. При reduced-motion или без WebGL —
          кросс-фейд 200 мс.
        </p>
        <RouteDemos />
      </section>

      <BeltDivider className="my-14" />

      <section>
        <SectionTitle n="B" title="Скролл-переходы (класс A)" />
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-steel">
          Привязаны к прогрессу скролла, обратимы, не блокируют скролл.
          Прокрути страницу — эффекты T4, T5, T7 и T8 сработают по мере
          появления блоков.
        </p>
        <ScrollDemos />
      </section>

      <BeltDivider className="my-14" />

      <section>
        <SectionTitle n="C" title="Отключение эффектов" />
        <p className="max-w-2xl text-sm leading-relaxed text-steel">
          Тумблер «Эффекты» слева снизу отключает шейдеры и анимации. При
          системном{" "}
          <span className="font-mono text-ash">prefers-reduced-motion</span>{" "}
          эффекты отключаются автоматически, а переходы становятся
          кросс-фейдом.
        </p>
      </section>
    </main>
  );
}
