import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  /** Maroon, tracked caps line above the heading, e.g. "Mon 5 Oct · Week -5". */
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small pill after the eyebrow, e.g. "Sample data". */
  pill?: ReactNode;
  className?: string;
}

/** Page heading used across the app (s05, p02, a01): eyebrow, Playfair title, optional lead. */
export function PageHeader({ eyebrow, title, subtitle, pill, className }: Props) {
  return (
    <header className={cn("pr-0 md:pr-72", className)}>
      {(eyebrow || pill) && (
        <div className="mb-1 flex flex-wrap items-center gap-3">
          {eyebrow && (
            <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              {eyebrow}
            </p>
          )}
          {pill && (
            <span className="bg-cream-soft text-navy-900 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              {pill}
            </span>
          )}
        </div>
      )}
      <h1 className="font-display text-3xl leading-tight font-bold md:text-[44px]">{title}</h1>
      {subtitle && <p className="text-navy-400 mt-2 max-w-3xl text-base md:text-lg">{subtitle}</p>}
    </header>
  );
}
