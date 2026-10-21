import Link from "next/link";
import { Wordmark } from "./Wordmark";

/** The wordmark as a link (or plain, when `href` is missing). */
export function Logo({
  href,
  className,
  tagline,
  tone = "light",
}: {
  href?: string;
  className?: string;
  tagline?: string;
  tone?: "dark" | "light";
  /** Kept for older call sites; the wordmark has one size now. */
  compact?: boolean;
}) {
  const mark = <Wordmark tagline={tagline} tone={tone} />;
  if (!href) return <span className={className}>{mark}</span>;
  return (
    <Link href={href} className={className}>
      {mark}
    </Link>
  );
}
