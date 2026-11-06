"use client";

import Link from "next/link";

import { errors } from "@/lib/content";

const copy = errors.error;

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-2xl flex-col justify-center px-6 py-20">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.5em] text-steel">
        {copy.eyebrow}
      </p>
      <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.92] sm:text-7xl">
        {copy.title}
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-steel">
        {copy.text}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-gold-apple/50 bg-gold-apple/10 px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-gold-apple transition-colors hover:bg-gold-apple/20"
        >
          {copy.retry}
        </button>
        <Link
          href="/"
          className="border border-graphite px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-steel transition-colors hover:text-ash"
        >
          {copy.home} →
        </Link>
      </div>
    </main>
  );
}
