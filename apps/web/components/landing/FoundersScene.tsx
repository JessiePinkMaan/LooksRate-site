"use client";

import { useEffect, useRef, useState } from "react";

import { cn, HoldButton, usePreferences } from "@loxrate/ui";

import { useTransition } from "@/components/motion/TransitionProvider";
import { founders as foundersContent } from "@/lib/content";

type FounderContent = {
  alias: string;
  role: string;
  responsibility?: string;
  telegram?: string;
  quote: string;
  quotes?: string[];
};

const people = foundersContent.founders as FounderContent[];

const dust = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 53 + 7) % 100}%`,
  delay: `${(index % 9) * -1.6}s`,
  size: index % 4 === 0 ? 3 : 2,
}));

const sceneQuotes = [
  {
    text: people[0]?.quotes?.[0] ?? people[0]?.quote ?? "",
    side: "left",
    who: people[0]?.alias ?? "",
  },
  {
    text: people[1]?.quotes?.[0] ?? people[1]?.quote ?? "",
    side: "right",
    who: people[1]?.alias ?? "",
  },
  {
    text: people[0]?.quotes?.[1] ?? "",
    side: "left",
    who: people[0]?.alias ?? "",
  },
  {
    text: people[1]?.quotes?.[1] ?? "",
    side: "right",
    who: people[1]?.alias ?? "",
  },
].filter((quote) => quote.text.length > 0);

/**
 * Флагманская сцена «Основатели» (ТЗ §7, комната 07).
 * Слоистая сцена: пол, световой круг за курсором, силуэты, пыль, луч лампы.
 * Скролл = спуск камеры + цитаты по одной. reduced-motion/без эффектов —
 * статичная композиция с hover-подсветкой.
 */
export function FoundersScene() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const { effects } = usePreferences();
  const { navigate } = useTransition();
  const [dossier, setDossier] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Драйвер света/скролла.
  useEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    if (!section || !scene) return;

    const reduce =
      !effects || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let targetX = 0.5;
    let targetY = 0.4;
    let lightX = 0.5;
    let lightY = 0.4;
    let running = false;
    let frame = 0;
    let lastQuote = -2;

    const quoteElements = Array.from(
      scene.querySelectorAll<HTMLElement>("[data-quote]"),
    );
    const cta = scene.querySelector<HTMLElement>("[data-cta]");
    const endApple = scene.querySelector<HTMLElement>("[data-end-apple]");

    const onPointer = (event: PointerEvent): void => {
      const rect = scene.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width;
      targetY = (event.clientY - rect.top) / rect.height;
    };

    const update = (): void => {
      const rect = section.getBoundingClientRect();
      const total = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / total));

      if (!reduce) {
        lightX += (targetX - lightX) * 0.12;
        lightY += (targetY - lightY) * 0.12;
      } else {
        lightX = 0.5;
        lightY = 0.4;
      }

      scene.style.setProperty("--p", progress.toFixed(4));
      scene.style.setProperty("--lx", `${(lightX * 100).toFixed(2)}%`);
      scene.style.setProperty("--ly", `${(lightY * 100).toFixed(2)}%`);
      scene.dataset.lamp = progress > 0.9 ? "off" : "on";

      let quoteIndex = -1;
      if (progress >= 0.3 && progress < 0.88) {
        quoteIndex = Math.min(
          quoteElements.length - 1,
          Math.floor((progress - 0.3) / (0.58 / quoteElements.length)),
        );
      }
      if (quoteIndex !== lastQuote) {
        lastQuote = quoteIndex;
        quoteElements.forEach((element, index) => {
          element.dataset.visible = index === quoteIndex ? "true" : "false";
        });
      }

      if (cta) cta.dataset.visible = progress > 0.88 ? "true" : "false";
      if (endApple) {
        endApple.dataset.visible = progress > 0.9 ? "true" : "false";
      }
    };

    const loop = (): void => {
      if (!running) return;
      update();
      frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          frame = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0.01 },
    );

    window.addEventListener("pointermove", onPointer, { passive: true });
    observer.observe(section);
    update();

    return () => {
      window.removeEventListener("pointermove", onPointer);
      observer.disconnect();
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [effects]);

  // Вход T7 «Опрокидывание» (onEnter), без инверсии скролла.
  useEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    if (!section || !scene) return;

    const reduce =
      !effects || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      scene.dataset.entered = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          scene.dataset.entered = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [effects]);

  // Esc закрывает досье.
  useEffect(() => {
    if (dossier === null) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setDossier(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dossier]);

  const dossierPerson = dossier !== null ? people[dossier] : null;

  return (
    <section
      ref={sectionRef}
      id="founders"
      className="relative"
      style={{ height: "420vh" }}
    >
      <div
        ref={sceneRef}
        className="founders-scene sticky top-0 h-svh overflow-hidden"
        data-entered="false"
        data-lamp="on"
        aria-label="Основатели: два силуэта в подвале, камера сверху вниз"
      >
        <div className="founders-floor" aria-hidden />
        <div className="founders-lamp" aria-hidden />
        <div className="founders-light" aria-hidden />
        <div className="founders-beam" aria-hidden />

        <div className="founders-dust" aria-hidden>
          {dust.map((particle, index) => (
            <span
              key={index}
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>

        <div className="founders-flip">
          <div className="founders-camera">
            {people.map((person, index) => (
              <button
                key={person.alias}
                type="button"
                className={cn(
                  "founder",
                  index === 0 ? "founder-a" : "founder-b",
                )}
                onClick={() => setDossier(index)}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-label={`Открыть досье: ${person.alias}`}
              >
                <img
                  src={index === 0 ? "/assets/founder-a.svg" : "/assets/founder-b.svg"}
                  alt=""
                  draggable={false}
                />
                {hovered === index ? (
                  <span className="founder-tip">
                    <span className="founder-tip-name">{person.alias}</span>
                    <span className="founder-tip-role">{person.role}</span>
                    <span className="founder-tip-quote">«{person.quote}»</span>
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="founders-labels" aria-hidden>
          <span>№ 001 · {people[0]?.alias}</span>
          <span>№ 002 · {people[1]?.alias}</span>
        </div>

        <div className="founders-title">
          <span>Основатели</span>
        </div>

        <div className="founders-quotes">
          {sceneQuotes.map((quote, index) => (
            <blockquote
              key={`${quote.who}-${index}`}
              data-quote
              data-side={quote.side}
              data-visible="false"
            >
              <p className="font-display text-xl leading-snug sm:text-2xl">
                «{quote.text}»
              </p>
              <cite className="mt-2 block font-mono text-[0.55rem] uppercase not-italic tracking-[0.25em] text-steel">
                — {quote.who}
              </cite>
            </blockquote>
          ))}
        </div>

        <div className="founders-cta" data-cta data-visible="false">
          <img
            src="/assets/apple.svg"
            alt=""
            width={48}
            height={48}
            data-end-apple
            data-visible="false"
          />
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.35em] text-steel">
            Подвал ждёт
          </p>
          <HoldButton
            onConfirm={() => navigate("/access", 2)}
            ariaLabel="Войти в Подвал"
          >
            Войти в Подвал
          </HoldButton>
        </div>

        <ul className="sr-only">
          {people.map((person) => (
            <li key={person.alias}>
              {person.alias} — {person.role}. {person.quote}
            </li>
          ))}
        </ul>
      </div>

      {dossierPerson ? (
        <div
          className="fixed inset-0 z-[400] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Досье: ${dossierPerson.alias}`}
        >
          <button
            type="button"
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={() => setDossier(null)}
            aria-label="Закрыть досье"
          />
          <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-graphite bg-basement p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember">
                Досье · № 00{(dossier ?? 0) + 1}
              </p>
              <button
                type="button"
                onClick={() => setDossier(null)}
                className="border border-graphite px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel transition-colors hover:text-ash"
              >
                Закрыть
              </button>
            </div>

            <h3 className="mt-8 font-heading text-4xl uppercase leading-none">
              {dossierPerson.alias}
            </h3>
            <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel">
              {dossierPerson.role}
            </p>
            {dossierPerson.responsibility ? (
              <p className="mt-4 text-sm leading-relaxed text-ash">
                Зона ответственности: {dossierPerson.responsibility}
              </p>
            ) : null}

            <div className="mt-6 space-y-4">
              {(dossierPerson.quotes ?? [dossierPerson.quote]).map((quote) => (
                <p
                  key={quote}
                  className="font-display text-lg italic leading-snug text-ash"
                >
                  «{quote}»
                </p>
              ))}
            </div>

            <a
              href={dossierPerson.telegram ?? "https://t.me/retawum"}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-8 inline-block border border-graphite px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash transition-colors hover:border-blood"
            >
              Telegram →
            </a>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
