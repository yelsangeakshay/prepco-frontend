import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({
  href,
  className,
  compact,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  const mark = (
    <>
      <span className="bg-maroon-600 flex size-9 shrink-0 items-center justify-center rounded-lg text-sm text-white">
        P
      </span>
      {!compact && <span>The Prep Co</span>}
    </>
  );
  if (!href) {
    return (
      <span className={cn("font-display flex items-center gap-2 text-xl font-bold", className)}>
        {mark}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label="The Prep Co"
      className={cn("font-display flex items-center gap-2 text-xl font-bold", className)}
    >
      {mark}
    </Link>
  );
}
