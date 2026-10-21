import { cn } from "@/lib/utils/cn";

interface Props {
  /** Line under the name, e.g. "Inception to offer letter". */
  tagline?: string;
  /** `dark` = on navy, `light` = on cream. */
  tone?: "dark" | "light";
  className?: string;
}

/** The "[ THE PREP CO. ]" wordmark from the mockups. */
export function Wordmark({ tagline, tone = "dark", className }: Props) {
  const dark = tone === "dark";
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span
        className={cn(
          "flex items-center gap-1.5 text-[19px] leading-none font-extrabold tracking-tight uppercase",
          dark ? "text-white" : "text-navy-900",
        )}
      >
        <span
          aria-hidden
          className={cn("text-[26px] font-semibold", dark ? "text-gold-300" : "text-maroon-600")}
        >
          [
        </span>
        The Prep Co.
        <span
          aria-hidden
          className={cn("text-[26px] font-semibold", dark ? "text-gold-300" : "text-maroon-600")}
        >
          ]
        </span>
      </span>
      {tagline && (
        <span className="text-gold-500 mt-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
          {tagline}
        </span>
      )}
    </span>
  );
}
