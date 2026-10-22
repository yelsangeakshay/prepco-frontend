import { cn } from "@/lib/utils/cn";

/** Decorative spinner. The element that is busy carries `aria-busy` and the text. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
