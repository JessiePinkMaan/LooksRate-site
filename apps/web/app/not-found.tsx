import Link from "next/link";

import { errors } from "@/lib/content";

const copy = errors.notFound;

export default function NotFound() {
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
      <Link
        href="/"
        className="mt-8 inline-flex w-fit border border-graphite px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ash transition-colors hover:border-gold-apple hover:text-gold-apple"
      >
        {copy.home} →
      </Link>
    </main>
  );
}
