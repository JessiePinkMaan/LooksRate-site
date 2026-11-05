import { cn } from "../cn";

/** «Ремень» с пряжкой как разделитель секций (ТЗ §4.3). */
export function BeltDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-steel/25 to-steel/50" />
      <span className="relative flex h-5 w-10 items-center justify-center border border-steel/50 bg-graphite">
        <span className="h-2.5 w-6 border border-steel/40" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-steel/25 to-steel/50" />
    </div>
  );
}
