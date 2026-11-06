"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { profile } from "@/lib/content";
import {
  addQuoteAction,
  deleteQuoteAction,
  type QuoteState,
} from "@/lib/profile-actions";

const copy = profile.quotes;
const EMPTY: QuoteState = {};

export type QuoteRow = {
  id: string;
  text: string;
  date: string;
};

/**
 * Стена цитат: большая выбранная цитата, лента карточек и форма.
 * Карточки читаются лучше бегущей строки, а выбранная цитата
 * работает как «главная мысль» профиля.
 */
export function QuoteBoard({ quotes }: { quotes: QuoteRow[] }) {
  const [state, submit, pending] = useActionState(addQuoteAction, EMPTY);
  const [length, setLength] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(
    quotes[0]?.id ?? null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    setLength(0);
    textareaRef.current?.blur();
  }, [state]);

  useEffect(() => {
    if (activeId && quotes.some((quote) => quote.id === activeId)) return;
    setActiveId(quotes[0]?.id ?? null);
  }, [quotes, activeId]);

  const active = quotes.find((quote) => quote.id === activeId) ?? quotes[0];

  return (
    <section className="profile-quotes" aria-labelledby="quotes-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.4em] text-steel">
            /me · quotes
          </p>
          <h2
            id="quotes-title"
            className="mt-1 font-heading text-3xl uppercase"
          >
            {copy.title}
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-steel">
          {copy.subtitle}
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="quote-featured" aria-live="polite">
          <span className="quote-featured-label">{copy.featured}</span>
          {active ? (
            <>
              <blockquote className="quote-featured-text">
                «{active.text}»
              </blockquote>
              <span className="quote-featured-date">{active.date}</span>
            </>
          ) : (
            <p className="quote-featured-empty">{copy.empty}</p>
          )}
          <span className="quote-featured-mark" aria-hidden>
            ”
          </span>
        </div>

        <form ref={formRef} action={submit} className="quote-form">
          <label htmlFor="quote-text" className="sr-only">
            {copy.placeholder}
          </label>
          <textarea
            ref={textareaRef}
            id="quote-text"
            name="text"
            rows={4}
            maxLength={220}
            required
            minLength={8}
            placeholder={copy.placeholder}
            onChange={(event) => setLength(event.target.value.length)}
            className="quote-input"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-steel">
              {length}/220
            </span>
            <button
              type="submit"
              disabled={pending}
              className="border border-gold-apple/50 bg-gold-apple/10 px-4 py-2 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-gold-apple transition-colors hover:bg-gold-apple/20 disabled:opacity-50"
            >
              {pending ? copy.pending : copy.add}
            </button>
          </div>
          <p className="mt-2 font-mono text-[0.45rem] uppercase tracking-[0.16em] text-steel">
            {copy.limit}
          </p>
          {state.error ? (
            <p
              role="alert"
              className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-blood"
            >
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-gold-apple">
              {copy.saved}
            </p>
          ) : null}
        </form>
      </div>

      {quotes.length > 0 ? (
        <ul className="quote-rail">
          {quotes.map((quote, index) => (
            <li
              key={quote.id}
              className="quote-card"
              data-active={quote.id === active?.id ? "true" : "false"}
              style={{ "--quote-index": index } as CSSProperties}
            >
              <button
                type="button"
                onClick={() => setActiveId(quote.id)}
                className="quote-card-text"
                aria-pressed={quote.id === active?.id}
              >
                «{quote.text}»
              </button>
              <div className="quote-card-foot">
                <span>{quote.date}</span>
                <form action={deleteQuoteAction}>
                  <input type="hidden" name="id" value={quote.id} />
                  <button type="submit" className="quote-card-remove">
                    {copy.remove}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
