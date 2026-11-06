"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@loxrate/ui";

import { AuthForm } from "@/components/auth/AuthForm";
import { entry } from "@/lib/content";

import { AppleImage } from "./AppleImage";

const STORAGE_KEY = "loxrate:entered";
const QUOTE_INTERVAL = 8000;
const TREMBLE_VOLUME = 0.63;

/** Тайминги интро. Держим синхронно с CSS (см. `.threshold-gate` intro). */
const INTRO = {
  flightAt: 2030,
  settleAt: 2920,
  doneAt: 3400,
  flightDuration: 860,
} as const;

type Phase = "sealed" | "choice" | "auth" | "exit" | "done";
type AuthMode = "login" | "register";

type ThresholdGateProps = {
  /** Уже вошёл - не показываем врата повторно. */
  initiallyEntered?: boolean;
};

/**
 * Врата входа (комната 00): большое яблоко в темноте, цитаты стоиков
 * и мягкий вход в сайт. Пока пользователь не нажал яблоко - вокруг только
 * свет и текст.
 *
 * После входа яблоко не крутится: оно дрожит и светится, пока шапка,
 * её пункты и заголовок собираются по очереди. В финале яблоко перелетает
 * на своё обычное место и уменьшается. reduced-motion/выключенные эффекты
 * дают короткий статичный переход.
 */
export function ThresholdGate({
  initiallyEntered = false,
}: ThresholdGateProps) {
  const router = useRouter();
  const { effects } = usePreferences();
  const [phase, setPhase] = useState<Phase>(
    initiallyEntered ? "done" : "sealed",
  );
  const [mode, setMode] = useState<AuthMode>("login");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [reduce, setReduce] = useState(false);
  const [appleHover, setAppleHover] = useState(false);
  const [settling, setSettling] = useState(false);
  const finishedRef = useRef(false);
  const appleRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<number[]>([]);
  const trembleAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (finishedRef.current) return;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") {
        setPhase("done");
        return;
      }
    } catch {
      /* приватный режим - врата просто покажутся */
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (): void => setReduce(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Цитаты меняются неспешно, пока открыт выбор.
  useEffect(() => {
    if (phase !== "sealed" && phase !== "choice") return;
    const timer = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % entry.quotes.length);
    }, QUOTE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Пока врата открыты, страница под ними не прокручивается.
  useEffect(() => {
    if (phase === "done") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  // Если компонент ушёл раньше времени - снимаем интро-атрибут и таймеры.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      document.documentElement.removeAttribute("data-intro");
    };
  }, []);

  const finishIntro = (): void => {
    document.documentElement.removeAttribute("data-intro");
    setPhase("done");
  };

  /** Звук дрожания играет всегда, независимо от переключателя звука. */
  const playTrembleSound = (): void => {
    if (typeof window === "undefined") return;

    const audio =
      trembleAudioRef.current ?? new Audio("/assets/audio/apple-tremble.mp3");
    trembleAudioRef.current = audio;
    audio.volume = TREMBLE_VOLUME;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* браузер может не дать автоплей - визуал не ломается */
    });

    for (let step = 0; step <= 10; step += 1) {
      timersRef.current.push(
        window.setTimeout(
          () => {
            audio.volume = Math.max(0, TREMBLE_VOLUME * (1 - step / 10));
          },
          INTRO.flightAt + step * 55,
        ),
      );
    }

    timersRef.current.push(
      window.setTimeout(() => {
        audio.pause();
      }, INTRO.flightAt + 650),
    );
  };

  const enterSite = (): void => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* без sessionStorage вход всё равно работает */
    }

    // Обновляем серверную шапку заранее, чтобы во время интро уже был
    // правильный пользователь, а не «Войти» из старого рендера.
    router.refresh();

    const motionOff =
      reduce ||
      !effects ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setPhase("exit");

    if (motionOff) {
      timersRef.current.push(window.setTimeout(finishIntro, 260));
      return;
    }

    document.documentElement.dataset.intro = "running";
    playTrembleSound();

    timersRef.current.push(
      window.setTimeout(() => {
        const apple = appleRef.current;
        const hero = document.querySelector<HTMLElement>("[data-hero-apple]");
        if (!apple || !hero) {
          finishIntro();
          return;
        }

        apple.dataset.flight = "true";
        const from = apple.getBoundingClientRect();
        const to = hero.getBoundingClientRect();
        const deltaX = to.left + to.width / 2 - (from.left + from.width / 2);
        const deltaY = to.top + to.height / 2 - (from.top + from.height / 2);
        const scale = Math.max(0.12, to.width / Math.max(1, from.width));

        apple.animate(
          [
            {
              transform: "translate3d(0, 0, 0) scale(1)",
              opacity: 1,
              filter:
                "drop-shadow(0 0 54px rgba(255, 232, 164, 0.8)) drop-shadow(0 0 130px rgba(201, 162, 39, 0.55))",
            },
            {
              transform: `translate3d(${deltaX * 0.55}px, ${deltaY * 0.35}px, 0) scale(${Math.max(
                scale * 1.08,
                1.02,
              )})`,
              opacity: 1,
              offset: 0.55,
              filter:
                "drop-shadow(0 0 38px rgba(255, 232, 164, 0.55)) drop-shadow(0 0 90px rgba(201, 162, 39, 0.38))",
            },
            {
              transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
              opacity: 1,
              filter:
                "drop-shadow(0 0 26px rgba(201, 162, 39, 0.35)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.75))",
            },
          ],
          {
            duration: INTRO.flightDuration,
            easing: "cubic-bezier(0.22, 0.9, 0.24, 1)",
            fill: "forwards",
          },
        );
      }, INTRO.flightAt),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setSettling(true);
        document.documentElement.removeAttribute("data-intro");

        const apple = appleRef.current;
        if (!apple) return;

        apple.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 420,
          easing: "ease",
          fill: "forwards",
        });

        // Ауру гасим отдельной анимацией: CSS-анимация заряда уже
        // удерживает opacity, поэтому transition здесь не сработает.
        const aura = document.querySelector<HTMLElement>(".threshold-aura");
        if (aura) {
          const from = getComputedStyle(aura).opacity;
          aura.style.animation = "none";
          aura.animate([{ opacity: from }, { opacity: 0 }], {
            duration: 420,
            easing: "ease",
            fill: "forwards",
          });
        }
      }, INTRO.settleAt),
    );

    timersRef.current.push(
      window.setTimeout(finishIntro, INTRO.doneAt),
    );
  };

  if (phase === "done") return null;

  const quote = entry.quotes[quoteIndex] ?? entry.quotes[0];
  const showForm = phase === "auth";
  const exiting = phase === "exit";
  const appleVariant =
    appleHover && (phase === "sealed" || phase === "choice")
      ? "cracked"
      : "whole";

  return (
    <div
      className="threshold-gate"
      data-phase={phase}
      data-settling={settling ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-label="Вход в LoxRate"
    >
      <div className="threshold-backdrop" aria-hidden />
      <div className="threshold-aura" aria-hidden />
      <div className="threshold-grain" aria-hidden />

      <div className="threshold-stage">
        <button
          ref={appleRef}
          type="button"
          onClick={() => {
            if (phase === "sealed") setPhase("choice");
          }}
          onMouseEnter={() => {
            if (phase === "sealed" || phase === "choice") setAppleHover(true);
          }}
          onMouseLeave={() => setAppleHover(false)}
          className="threshold-apple"
          data-compact={showForm ? "true" : "false"}
          aria-label={entry.appleLabel}
        >
          <AppleImage
            variant={appleVariant}
            sizes="(max-width: 640px) 62vw, 430px"
            width={430}
            height={430}
            fetchPriority="high"
          />
        </button>

        <div className="threshold-copy" data-visible={exiting ? "false" : "true"}>
          {showForm ? (
            <div className="threshold-form">
              <AuthForm
                initialMode={mode}
                onSuccess={enterSite}
                className="mx-auto max-w-sm"
              />
              <button
                type="button"
                onClick={() => setPhase("choice")}
                className="mt-6 font-mono text-[0.55rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
              >
                ← {entry.actions.back}
              </button>
            </div>
          ) : (
            <>
              <blockquote key={quoteIndex} className="threshold-quote">
                <p className="font-display text-lg italic leading-snug text-ash sm:text-2xl">
                  «{quote.text}»
                </p>
                <cite className="mt-3 block font-mono text-[0.55rem] uppercase not-italic tracking-[0.32em] text-steel">
                  - {quote.author}
                </cite>
              </blockquote>

              {phase === "choice" ? (
                <div className="threshold-choice">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setPhase("auth");
                    }}
                    className="threshold-button threshold-button-primary"
                  >
                    {entry.actions.register}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setPhase("auth");
                    }}
                    className="threshold-button"
                  >
                    {entry.actions.login}
                  </button>
                  <button
                    type="button"
                    onClick={enterSite}
                    className="threshold-guest"
                  >
                    {entry.actions.guest}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhase("choice")}
                  className="threshold-hint"
                >
                  <span className="threshold-hint-dot" aria-hidden />
                  {entry.hint}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
