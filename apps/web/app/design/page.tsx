import type { Metadata } from "next";
import Link from "next/link";

import { BeltDivider, RivetedCard } from "@loxrate/ui";

import { HoldDemo } from "./HoldDemo";

export const metadata: Metadata = {
  title: "Стенд дизайн-системы",
};

const palette = [
  { token: "void", hex: "#030303", note: "фон «пустота»" },
  { token: "basement", hex: "#0A0A0B", note: "основной фон" },
  { token: "concrete", hex: "#131315", note: "карточки" },
  { token: "graphite", hex: "#1C1C20", note: "поднятые поверхности" },
  { token: "steel", hex: "#7F848E", note: "вторичный текст" },
  { token: "ash", hex: "#E9E4DA", note: "основной текст" },
  { token: "blood", hex: "#B3121B", note: "акцент 🔴" },
  { token: "blood-deep", hex: "#6E0A10", note: "тени/ховер" },
  { token: "ember", hex: "#FF3B2F", note: "редкая вспышка" },
  { token: "gold-apple", hex: "#C9A227", note: "только яблоко/высший ранг" },
  { token: "bone", hex: "#CFC6B4", note: "мрамор/стоа" },
] as const;

const typeSamples = [
  {
    label: "Display · Cormorant Garamond",
    className: "font-display text-4xl italic",
    text: "Memento mori. Amor fati.",
  },
  {
    label: "Heading · Oswald",
    className: "font-heading text-4xl uppercase tracking-[0.04em]",
    text: "Будь неудобным",
  },
  {
    label: "Mono · IBM Plex Mono",
    className: "font-mono text-2xl",
    text: "№ 001 · РАНГ R4 · XP 3500",
  },
  {
    label: "Body · Inter",
    className: "font-sans text-xl",
    text: "Кость — не твоя. Дисциплина — твоя.",
  },
] as const;

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

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-14">
      <header className="mb-16 max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
            /_design · phase 1
          </p>
          <Link
            href="/"
            className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
          >
            ← на порог
          </Link>
        </div>
        <h1 className="mt-5 font-heading text-6xl uppercase leading-[0.9] tracking-[0.02em] sm:text-8xl">
          Дизайн-система
        </h1>
        <p className="mt-5 text-pretty text-sm leading-relaxed text-steel">
          Стенд токенов и компонентов. Всё проверяется здесь до сборки комнат:
          палитра, типографика, фактуры, hold-взаимодействие и курсор.
        </p>
      </header>

      <section className="mb-16">
        <SectionTitle n="01" title="Палитра" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {palette.map((swatch) => (
            <div key={swatch.token} className="border border-graphite">
              <div
                className="h-16"
                style={{ backgroundColor: swatch.hex }}
              />
              <div className="p-3">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ash">
                  {swatch.token}
                </p>
                <p className="font-mono text-[0.6rem] text-steel">
                  {swatch.hex}
                </p>
                <p className="mt-1 text-[0.65rem] leading-snug text-steel">
                  {swatch.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BeltDivider className="my-14" />

      <section className="mb-16">
        <SectionTitle n="02" title="Типографика" />
        <div className="space-y-9">
          {typeSamples.map((sample) => (
            <div key={sample.label} className="border-l border-graphite pl-5">
              <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-steel">
                {sample.label}
              </p>
              <p className={sample.className}>{sample.text}</p>
            </div>
          ))}

          <div className="pt-4">
            <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-steel">
              Hero · clamp()
            </p>
            <p className="font-heading text-[clamp(2.75rem,11vw,9rem)] uppercase leading-[0.82] tracking-[0.01em]">
              Будь
              <br />
              неудобным.
            </p>
          </div>
        </div>
      </section>

      <BeltDivider className="my-14" />

      <section className="mb-16">
        <SectionTitle n="03" title="Hold-взаимодействие" />
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-5 max-w-md text-sm leading-relaxed text-steel">
              Ключевые действия — удержанием 0.8–1.2 с с отменой при уходе. При
              reduced-motion или выключенных эффектах превращается в обычный
              клик.
            </p>
            <HoldDemo />
          </div>
          <RivetedCard label="Кодекс" number="№ 004">
            <p className="font-display text-3xl italic leading-snug">
              «Не ломай то, что нельзя починить.»
            </p>
            <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel">
              подвал · правило 4
            </p>
          </RivetedCard>
        </div>
      </section>

      <BeltDivider className="my-14" />

      <section className="mb-16">
        <SectionTitle n="04" title="Карточки и фурнитура" />
        <div className="grid gap-4 sm:grid-cols-2">
          <RivetedCard label="Ранг" number="R4">
            <p className="font-heading text-4xl uppercase">Чадлайт</p>
            <p className="mt-2 text-sm text-steel">
              3 500 XP · вес голоса ×1.5 · рамка «красная нить»
            </p>
          </RivetedCard>
          <RivetedCard label="Тариф" number="T2">
            <p className="font-heading text-4xl uppercase">Подвал</p>
            <p className="mt-2 text-sm text-steel">
              Вся основная библиотека Vault · расширенные комментарии
            </p>
          </RivetedCard>
        </div>
      </section>

      <BeltDivider className="my-14" />

      <section>
        <SectionTitle n="05" title="Курсор и эффекты" />
        <p className="max-w-2xl text-sm leading-relaxed text-steel">
          Наведи на кнопку или карточку — красное кольцо реагирует на интерактив.
          Тумблеры «Эффекты» и «Звук» — в левом нижнем углу. «Эффекты: выкл»
          убирает курсор и анимации; при системном{" "}
          <span className="font-mono text-ash">prefers-reduced-motion</span>{" "}
          эффекты отключаются автоматически.
        </p>
      </section>
    </main>
  );
}
