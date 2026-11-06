"use client";

import { useEffect, useRef, useState } from "react";

import { usePreferences } from "@loxrate/ui";

import { manifest } from "@/lib/content";

import { AppleImage } from "./AppleImage";

const TOTAL = manifest.paragraphs.length;

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Манифест на главной: sticky-сцена с параллаксом.
 * Параграфы пролетают через глубину - активный в фокусе, соседние
 * размыты и сдвинуты по Z. При reduced-motion/выключенных эффектах
 * блок разворачивается в обычный статичный список.
 */
export function ManifestScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLLIElement | null>>([]);
  const { effects } = usePreferences();
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    const reduce =
      !effects ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimated(!reduce);
  }, [effects]);

  useEffect(() => {
    if (!animated) return;

    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let ticking = false;

    const update = (): void => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const total = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / total);
      stage.style.setProperty("--p", progress.toFixed(4));

      const position = progress * Math.max(0, TOTAL - 1);
      const gap = window.innerWidth < 640 ? 31 : 38;

      lineRefs.current.forEach((line, index) => {
        if (!line) return;
        const distance = index - position;
        const depth = Math.min(1, Math.abs(distance));
        const opacity = Math.max(0, 1 - Math.abs(distance) * 0.78);

        line.style.opacity = opacity.toFixed(3);
        line.style.transform = `translate3d(0, ${(distance * gap).toFixed(
          2,
        )}vh, ${(-depth * 280).toFixed(1)}px) rotateX(${(
          -distance * 34
        ).toFixed(2)}deg) scale(${(1 - depth * 0.13).toFixed(3)})`;
        line.style.filter = `blur(${(depth * 6).toFixed(2)}px)`;
        line.dataset.active = Math.abs(distance) < 0.5 ? "true" : "false";
        line.style.pointerEvents = Math.abs(distance) < 0.5 ? "auto" : "none";
      });
    };

    const onScroll = (): void => {
      if (ticking) return;
      ticking = true;
      frame = requestAnimationFrame(update);
    };

    const onReducedChange = (): void => {
      if (reduce.matches) {
        setAnimated(false);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", onReducedChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onReducedChange);
    };
  }, [animated]);

  return (
    <section
      ref={sectionRef}
      id="manifest"
      className="manifest-scroll"
      data-static={animated ? "false" : "true"}
      style={
        animated
          ? { height: `${TOTAL * 72 + 90}vh` }
          : undefined
      }
      aria-labelledby="manifest-title"
    >
      <div ref={stageRef} className="manifest-stage">
        <div className="manifest-depth" aria-hidden>
          <span className="manifest-ghost manifest-ghost-a">
            <AppleImage variant="whole" sizes="220px" width={220} height={220} />
          </span>
          <span className="manifest-ghost manifest-ghost-b">
            <AppleImage
              variant="cracked"
              sizes="160px"
              width={160}
              height={160}
            />
          </span>
          <span className="manifest-ghost manifest-ghost-c">
            <AppleImage variant="bitten" sizes="110px" width={110} height={110} />
          </span>
          <span className="manifest-ghost manifest-ghost-d">
            <img
              src="/assets/manifest-apple-a-180.webp"
              srcSet="/assets/manifest-apple-a-180.webp 180w, /assets/manifest-apple-a-389.webp 389w"
              sizes="(max-width: 640px) 100px, 175px"
              width={180}
              height={230}
              alt=""
              draggable={false}
            />
          </span>
          <span className="manifest-ghost manifest-ghost-e">
            <img
              src="/assets/manifest-apple-b-140.webp"
              srcSet="/assets/manifest-apple-b-140.webp 140w, /assets/manifest-apple-b-290.webp 290w"
              sizes="(max-width: 640px) 80px, 130px"
              width={140}
              height={202}
              alt=""
              draggable={false}
            />
          </span>
        </div>

        <div className="manifest-head">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.42em] text-steel">
            {manifest.eyebrow}
          </p>
          <h2
            id="manifest-title"
            className="mt-2 font-heading text-4xl uppercase leading-[0.92] sm:text-6xl"
          >
            {manifest.title}
          </h2>
        </div>

        <ol className="manifest-lines">
          {manifest.paragraphs.map((paragraph, index) => (
            <li
              key={paragraph}
              ref={(element) => {
                lineRefs.current[index] = element;
              }}
              className="manifest-line"
              data-active={animated && index === 0 ? "true" : "false"}
            >
              <span className="manifest-line-index" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="manifest-line-text">{paragraph}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
