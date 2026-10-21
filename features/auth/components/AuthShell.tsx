import type { ReactNode } from "react";
import Link from "next/link";
import { Check, CircleUserRound } from "lucide-react";
import { Logo } from "@/components/shell/Logo";
import { ROUTES } from "@/lib/config/routes";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/utils/notify";
import { cn } from "@/lib/utils/cn";

const POINTS = [
  "A CV a panel can't pull apart, versioned and locked.",
  "An answer bank built from your own CV.",
  "Panels run by people working in your target function.",
];

/** Navy panel with faint diagonal rules and a maroon glow, as drawn in s01.png. */
const PANEL_BG = {
  backgroundImage:
    "radial-gradient(ellipse at 15% 0%, rgba(124,31,52,0.45), transparent 55%), repeating-linear-gradient(105deg, transparent 0 118px, rgba(255,255,255,0.05) 118px 119px)",
} as const;

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Which tab is active. Sign in and sign up share one frame. */
  active: "sign-in" | "sign-up";
  /** Content under the form. Shown at every width. */
  below?: ReactNode;
  /** Content under the form that only shows on a phone. */
  belowPhone?: ReactNode;
}

function Tabs({ active }: { active: Props["active"] }) {
  const base = "rounded-control flex min-h-11 items-center justify-center text-sm font-semibold";
  return (
    <nav
      aria-label="Account"
      className="bg-cream-soft rounded-card mt-6 hidden grid-cols-2 gap-1 p-1 lg:grid"
    >
      <Link
        href={ROUTES.signIn}
        aria-current={active === "sign-in" ? "page" : undefined}
        className={cn(base, active === "sign-in" ? "text-navy-900 bg-white" : "text-navy-400")}
      >
        Sign in
      </Link>
      <Link
        href={ROUTES.signUp}
        aria-current={active === "sign-up" ? "page" : undefined}
        className={cn(base, active === "sign-up" ? "text-navy-900 bg-white" : "text-navy-400")}
      >
        Create account
      </Link>
    </nav>
  );
}

/** Sign in and sign up: navy brand panel on the left, the form on cream (a column on a phone). */
export function AuthShell({ title, subtitle, children, active, below, belowPhone }: Props) {
  return (
    <main className="bg-cream flex min-h-dvh w-full flex-col lg:flex-row">
      <section
        style={PANEL_BG}
        className="bg-navy-900 flex flex-col px-5 pt-6 pb-8 text-white lg:w-1/2 lg:px-[78px] lg:py-[60px]"
      >
        <Logo href={ROUTES.signIn} tone="dark" tagline="Inception to offer letter" />
        <div className="mt-10 lg:mt-auto">
          <p className="text-gold-300 hidden text-xs font-semibold tracking-[0.18em] uppercase lg:block">
            Season 1 · Finals &amp; Summers
          </p>
          <p className="font-display text-[34px] leading-[1.1] font-bold lg:mt-5 lg:text-[56px]">
            You get one shot at The Day.
          </p>
          <p className="mt-3 text-lg text-white/70 lg:mt-6 lg:text-xl">
            Bleed in the mocks. Not the interview.
          </p>
          <ul className="mt-10 hidden space-y-4 lg:block">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-base">
                <Check className="text-gold-300 mt-0.5 size-5 shrink-0" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-auto hidden pt-16 text-sm text-white/70 lg:block">
          One CV. One answer bank. One panel that&apos;s watched you improve.
        </p>
      </section>
      <section className="flex flex-1 flex-col px-5 py-8 lg:items-center lg:justify-center lg:py-12">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col lg:block lg:flex-none">
          <h1 className="font-display text-navy-900 text-[32px] leading-tight font-bold lg:text-[40px]">
            {title}
          </h1>
          {subtitle && <p className="text-navy-400 mt-2 hidden text-base lg:block">{subtitle}</p>}
          <Tabs active={active} />
          <div className="mt-6">{children}</div>
          {below}
          {belowPhone && <div className="mt-auto pt-10 text-center lg:hidden">{belowPhone}</div>}
        </div>
      </section>
    </main>
  );
}

/** One of the three account-recovery boards (e01.png): a plain header bar and a card on cream. */
export function RecoveryShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-cream min-h-dvh">
      <header className="border-line flex items-center justify-between border-b px-5 py-4 lg:px-14">
        <Logo href={ROUTES.signIn} tone="light" tagline="Inception to offer letter" />
        <AuthLink href={ROUTES.signIn}>Back to sign in</AuthLink>
      </header>
      <div className="mx-auto w-full max-w-md px-5 py-10 lg:py-16">
        <p className="text-maroon-600 text-xs font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <div className="rounded-feature border-line mt-4 border bg-white p-6 lg:p-8">
          <h1 className="font-display text-navy-900 text-[28px] leading-tight font-bold">
            {title}
          </h1>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </main>
  );
}

/** A single centred card with the wordmark above it. Used by pages the mockups do not split. */
export function CardShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <Logo href={ROUTES.signIn} className="mb-6 self-center" />
      <div className="rounded-feature border-line border bg-white p-6">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-navy-400 mt-1 text-sm">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="text-navy-400 mt-4 text-center text-sm">{footer}</p>}
    </main>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-maroon-600 font-semibold underline">
      {children}
    </Link>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-control mb-4 p-3 text-sm">
      {children}
    </p>
  );
}

/** Placeholder while a lazily loaded auth form arrives. */
export function AuthSkeleton() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <div
        role="status"
        aria-label="Loading"
        className="bg-cream-soft h-80 animate-pulse rounded-2xl"
      />
    </main>
  );
}

/** Google sign-in is not wired in the mock; the button says so. Proposed: the real flow needs the OAuth provider. */
export function GoogleButton() {
  return (
    <Button
      variant="secondary"
      className="min-h-[52px] w-full"
      onClick={() => notify("Google sign-in is not connected in this preview")}
    >
      <CircleUserRound className="size-5" aria-hidden />
      Continue with Google
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="text-navy-400 my-5 flex items-center gap-3 text-sm" aria-hidden>
      <span className="bg-line h-px flex-1" />
      <span>
        or<span className="hidden lg:inline"> with email</span>
      </span>
      <span className="bg-line h-px flex-1" />
    </div>
  );
}
