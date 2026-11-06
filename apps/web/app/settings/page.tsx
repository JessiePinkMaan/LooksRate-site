import type { Metadata } from "next";

import { EffectsToggle, SoundToggle } from "@loxrate/ui";

export const metadata: Metadata = {
  title: "Настройки",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-12">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
        /settings
      </p>
      <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.9]">
        Настройки
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel">
        Эффекты, звук и комфорт. Настройки сохраняются в этом браузере и
        применяются на всех страницах.
      </p>

      <div className="mt-10 space-y-4">
        <section className="border border-graphite bg-concrete p-5">
          <h2 className="font-heading text-2xl uppercase">Эффекты</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel">
            Анимации, свечение, параллакс и переходы между страницами. Если
            выключить - останется статичная версия без движения.
          </p>
          <div className="mt-4">
            <EffectsToggle />
          </div>
        </section>

        <section className="border border-graphite bg-concrete p-5">
          <h2 className="font-heading text-2xl uppercase">Звук</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel">
            Тихие звуки интерфейса. По умолчанию выключены, автоплея нет.
          </p>
          <div className="mt-4">
            <SoundToggle />
          </div>
        </section>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-steel">
        Если в системе включено «уменьшение движения», анимации отключаются
        автоматически - независимо от этой настройки.
      </p>
    </main>
  );
}
