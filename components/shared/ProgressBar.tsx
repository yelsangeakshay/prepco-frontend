import { cn } from "@/lib/utils/cn";

interface Props {
  value: number;
  max?: number;
  label: string;
  className?: string;
  /** Track colour for use on navy cards. */
  onDark?: boolean;
}

/** Maroon to gold gradient bar. */
export function ProgressBar({ value, max = 100, label, className, onDark }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "h-2 overflow-hidden rounded-full",
        onDark ? "bg-white/15" : "bg-cream-soft",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[var(--maroon-600)] to-[var(--gold-500)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
