import type { ReactNode } from "react";

import { cn } from "../cn";

export type RivetedCardProps = {
  children: ReactNode;
  label?: string;
  number?: string;
  className?: string;
};

function Rivet({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-2 w-2 rounded-full",
        "bg-[radial-gradient(circle_at_30%_30%,#6e727a,#1c1c20_70%)]",
        "shadow-[inset_0_0_1px_#000]",
        className,
      )}
    />
  );
}

/**
 * Карточка с фактурой «папка дела»: заклёпки по углам + «строчка»
 * (dashed inner border). Строго декоративно (ТЗ §4.3).
 */
export function RivetedCard({
  children,
  label,
  number,
  className,
}: RivetedCardProps) {
  return (
    <div
      className={cn(
        "relative border border-graphite bg-concrete p-6",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-2 border border-dashed border-steel/20"
      />
      <Rivet className="left-1.5 top-1.5" />
      <Rivet className="right-1.5 top-1.5" />
      <Rivet className="bottom-1.5 left-1.5" />
      <Rivet className="bottom-1.5 right-1.5" />

      {(label || number) && (
        <div className="relative mb-4 flex items-center justify-between gap-4">
          {label ? (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-steel">
              {label}
            </p>
          ) : (
            <span />
          )}
          {number ? (
            <span className="font-mono text-[0.65rem] text-steel">
              {number}
            </span>
          ) : null}
        </div>
      )}

      <div className="relative">{children}</div>
    </div>
  );
}
