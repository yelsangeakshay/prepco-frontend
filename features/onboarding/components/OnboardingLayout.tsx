import type { ReactNode } from "react";
import { Logo } from "@/components/shell/Logo";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Card } from "@/components/ui/card";

interface Props {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  banner?: ReactNode;
  children: ReactNode;
}

export function OnboardingLayout({ step, total, title, subtitle, banner, children }: Props) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-xl px-4 py-8">
      <Logo className="mb-6" />
      <p className="text-navy-400 text-xs font-semibold tracking-widest uppercase">
        Step {step} of {total}
      </p>
      <ProgressBar
        className="mt-2"
        value={step}
        max={total}
        label={`Onboarding step ${step} of ${total}`}
      />
      {banner && <div className="mt-4">{banner}</div>}
      <Card variant="feature" className="mt-4">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-navy-400 mt-1 text-sm">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </Card>
    </main>
  );
}
