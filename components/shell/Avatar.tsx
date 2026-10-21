import { cn } from "@/lib/utils/cn";

const TONE = {
  maroon: "bg-maroon-600 text-white",
  navy: "bg-navy-900 text-white",
  gold: "bg-gold-500 text-navy-900",
} as const;

/** Round initials badge: maroon for students, navy for panelists, gold for ops. */
export function Avatar({
  initials,
  tone = "maroon",
  label,
  className,
}: {
  initials: string;
  tone?: keyof typeof TONE;
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={label ?? initials}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        TONE[tone],
        className,
      )}
    >
      {initials}
    </span>
  );
}
