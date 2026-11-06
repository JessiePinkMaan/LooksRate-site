"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { entry } from "@/lib/content";

const STORAGE_KEY = "loxrate:entered";
const QUOTE_INTERVAL = 8000;

type Phase = "sealed" | "choice" | "auth" | "exit" | "done";
type AuthMode = "login" | "register";

type ThresholdGateProps = {
  /** Уже вошёл — не показываем врата повторно. */
  initiallyEntered?: boolean;
};

/**
 * Врата входа (комната 00): большое яблоко в темноте, цитаты стоиков
 * и мягкий вход в сайт. Пока пользователь не нажал яблоко — вокруг только
 * свет и текст. Эффекты уважают reduced-motion.
 */
export function ThresholdGate({
  initiallyEntered = false,
}: ThresholdGateProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(
    initiallyEntered ? "done" : "sealed",
  );
  const [mode, setMode] = useState<AuthMode>("login");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [reduce, setReduce] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (finishedRef.current) return;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") {
        setPhase("done");
        return;
      }
    } catch {
      /* приватный режим — врата просто покажутся */
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

  const enterSite = (): void => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* без sessionStorage вход всё равно работает */
    }
    setPhase("exit");
    window.setTimeout(
      () => {
        setPhase("done");
        router.refresh();
      },
      reduce ? 320 : 1500,
    );
  };

  if (phase === "done") return null;

  const quote = entry.quotes[quoteIndex] ?? entry.quotes[0];
  const showForm = phase === "auth";
  const exiting = phase === "exit";

  return (
    <div
      className="threshold-gate"
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label="Вход в LoxRate"
    >
      <div className="threshold-backdrop" aria-hidden />
      <div className="threshold-aura" aria-hidden />
      <div className="threshold-grain" aria-hidden />

      <div className="threshold-stage">
        <button
          type="button"
          onClick={() => {
            if (phase === "sealed") setPhase("choice");
          }}
          className="threshold-apple"
          data-spin={exiting ? "true" : "false"}
          data-compact={showForm ? "true" : "false"}
          aria-label={entry.appleLabel}
        >
          <img
            src="/assets/apple-photo.webp"
            alt=""
            width={420}
            height={436}
            draggable={false}
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
                  — {quote.author}
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
