import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TLink } from "@/components/motion/TLink";
import { legal } from "@/lib/content";

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return legal.docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = legal.docs.find((item) => item.slug === slug);
  return { title: doc ? doc.title : "Юридическое" };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const doc = legal.docs.find((item) => item.slug === slug);

  if (!doc) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-28 pt-16">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-steel">
          /legal/{doc.slug}
        </p>
        <TLink
          href="/"
          className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-steel transition-colors hover:text-ash"
        >
          ← на порог
        </TLink>
      </div>

      <h1 className="mt-5 font-heading text-4xl uppercase leading-[0.95] sm:text-6xl">
        {doc.title}
      </h1>
      <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-steel">
        обновлено {doc.updated} · шаблон, финал согласует владелец/юрист
      </p>

      <div className="mt-8 space-y-4">
        {doc.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-ash">
            {paragraph}
          </p>
        ))}
      </div>
    </main>
  );
}
