import type { ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import { Logo } from "@/components/shell/Logo";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";

export const STEP_NAMES = ["About you", "Track & target", "Your current CV"] as const;

interface Props {
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  banner?: ReactNode;
  /** Right-hand column on wide screens (the "What happens next" card). */
  aside?: ReactNode;
  children: ReactNode;
}

/** Wide screens: wordmark, three named steps and "Save & exit" in a header bar (s02.png). */
function DesktopSteps({ step }: { step: number }) {
  return (
    <ol aria-label="Onboarding steps" className="hidden items-center gap-10 lg:flex">
      {STEP_NAMES.map((name, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li
            key={name}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex items-center gap-3 text-[17px] font-medium",
              current ? "text-navy-900" : "text-navy-400",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-10 place-items-center rounded-full text-sm font-semibold",
                done && "bg-navy-900 text-white",
                current && "bg-maroon-600 text-white",
                !done && !current && "border-line border bg-white",
              )}
            >
              {done ? <Check className="size-4" /> : n}
            </span>
            {name}
            {done && <span className="sr-only"> (done)</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Phone: a back chevron, "Step n of 3" and three bar segments. */
function PhoneSteps({ step, backHref }: { step: number; backHref?: string }) {
  return (
    <div className="border-line border-b lg:hidden">
      <div className="flex items-center px-5 pt-5">
        {backHref ? (
          <Link href={backHref} aria-label="Back" className="-ml-3 grid size-11 place-items-center">
            <ChevronLeft className="size-6" aria-hidden />
          </Link>
        ) : (
          <span className="size-11" aria-hidden />
        )}
        <p className="text-navy-400 flex-1 pr-8 text-center text-[17px] font-semibold">
          Step {step} of 3
        </p>
      </div>
      <div className="flex gap-2 px-5 pt-2 pb-4" role="img" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1 flex-1 rounded-full",
              n < step ? "bg-navy-900" : n === step ? "bg-maroon-600" : "bg-line",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function OnboardingLayout({ step, title, subtitle, banner, aside, children }: Props) {
  const backHref = step > 1 ? ROUTES.student.onboarding((step - 1) as 1 | 2) : undefined;
  return (
    <div className="bg-cream min-h-dvh">
      <header className="border-line hidden items-center justify-between border-b px-14 py-5 lg:flex">
        <Logo tone="light" tagline="Inception to offer letter" className="lg:w-60" />
        <DesktopSteps step={step} />
        <Link
          href={ROUTES.signIn}
          className="text-maroon-600 w-60 text-right font-semibold underline"
        >
          Save &amp; exit
        </Link>
      </header>
      <PhoneSteps step={step} backHref={backHref} />
      <main
        className={cn(
          "mx-auto w-full px-5 pt-8 pb-10 lg:pt-14",
          aside
            ? "max-w-[1180px] lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:gap-14"
            : "max-w-[1180px]",
        )}
      >
        <div className={cn(!aside && "max-w-[800px]")}>
          <p className="text-maroon-600 text-xs font-semibold tracking-[0.18em] uppercase">
            <span className="lg:hidden">{STEP_NAMES[step - 1]}</span>
            <span className="hidden lg:inline">Step {step} of 3</span>
          </p>
          <h1 className="font-display text-navy-900 mt-3 text-[32px] leading-tight font-bold lg:text-[44px]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-navy-400 mt-3 hidden max-w-xl text-lg lg:block">{subtitle}</p>
          )}
          {banner && <div className="mt-6">{banner}</div>}
          <div className="mt-6 lg:mt-8">{children}</div>
        </div>
        {aside && <aside className="mt-8 hidden space-y-4 lg:mt-1 lg:block">{aside}</aside>}
      </main>
    </div>
  );
}
