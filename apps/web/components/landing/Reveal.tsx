"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** Построчное появление при попадании в вьюпорт (ТЗ §8, комната 02). */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.dataset.visible = "true";
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible="false"
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
