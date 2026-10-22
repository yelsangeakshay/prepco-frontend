"use client";

import { useState } from "react";
import Link from "next/link";
import { useNavigate } from "@/lib/nav/useNavigate";
import { ArrowRight, CheckCircle2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { FUNCTIONS, PANEL_FOR_TARGET } from "@/features/onboarding/schemas";
import { useSessions } from "@/features/runway/hooks/useRunway";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatDay } from "@/lib/utils/dates";
import { useChangeTarget, useProfile } from "../hooks/useProfile";

type Fn = (typeof FUNCTIONS)[number];

const eyebrow = "text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase";
const CARRIES = [
  "Locked CV and its version history",
  "Profiling notes and P1 feedback",
  "Every answer you've drafted",
  "Your plan, sessions used and Day 0 date",
];

/** E9 change target role (e09.png). */
export function ChangeTargetView() {
  const { navigate } = useNavigate();
  const profile = useProfile();
  const sessions = useSessions();
  const change = useChangeTarget();
  const [picked, setPicked] = useState<Fn | null>(null);

  if (profile.isPending) return <PageSkeleton />;
  if (profile.isError || !profile.data) return <ErrorCard onRetry={() => profile.refetch()} />;

  if (change.data) {
    return (
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <Card variant="feature" data-testid="target-result">
          <CheckCircle2 className="size-10 text-green-600" aria-hidden />
          <h1 className="font-display mt-3 text-2xl font-bold">Target updated</h1>
          <p className="text-navy-400 mt-1 text-sm">
            {change.data.answersToRework} answers and {change.data.cvBulletsToReframe} CV bullets
            need a new angle.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={`${ROUTES.student.answers}?status=flagged`}>Rework answers</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={ROUTES.student.profile}>Back to profile</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const current = profile.data.target.function as Fn;
  const next = picked && picked !== current ? picked : null;
  const nextName = next ? next.split(" & ")[0]! : null;
  const deepDive = sessions.data?.items.find((s) => s.kind === "deep-dive" && s.startsAt);
  const when = deepDive?.startsAt ? ` (${formatDay(deepDive.startsAt)})` : "";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <PageHeader
        title="Change your target role"
        subtitle="If your target shifts, we re-assign you rather than run the wrong panel."
      />

      <Card variant="feature" className="space-y-4 p-6">
        <h2 id="new-target" className="font-semibold">
          New target role
        </h2>
        <div role="group" aria-labelledby="new-target" className="flex flex-wrap gap-3">
          {FUNCTIONS.map((f) => {
            const isCurrent = f === current;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={next === f}
                disabled={isCurrent}
                onClick={() => setPicked(f)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium",
                  next === f
                    ? "border-maroon-600 bg-maroon-600 text-white"
                    : "border-line bg-white",
                  isCurrent && "text-navy-400 cursor-default line-through",
                )}
              >
                {f}
                {isCurrent && <span className="sr-only"> (current target)</span>}
              </button>
            );
          })}
        </div>
        <div className="bg-cream-soft rounded-card flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
          <span className="text-navy-900 rounded-full bg-[#E9E6EE] px-3 py-1 text-xs font-bold tracking-wider uppercase">
            {PANEL_FOR_TARGET[current]} panel
          </span>
          <ArrowRight className="text-maroon-600 size-5" aria-hidden />
          <span className="bg-maroon-100 text-maroon-600 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
            {next ? `${PANEL_FOR_TARGET[next]} panel` : "Pick a role"}
          </span>
          <span className="text-navy-400">New panelist assigned within a day</span>
        </div>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
        <Card variant="feature" className="p-6">
          <h2 className={eyebrow}>Carries over, unchanged</h2>
          <ul className="mt-4 space-y-3">
            {CARRIES.map((c) => (
              <li key={c} className="flex gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </Card>
        <Card variant="feature" className="p-6">
          <h2 className={eyebrow}>Changes</h2>
          <ul className="mt-4 space-y-3">
            {[
              `Deep-dive${when} moves to ${nextName ? `a ${nextName} practitioner` : "a practitioner in your new function"}. Same time if they're free.`,
              nextName
                ? `6 new role questions added to your answer bank ("Why ${nextName.toLowerCase()}?" and the like)`
                : "6 new role questions added to your answer bank",
              nextName
                ? `Your CV may need a re-lock to lead with ${nextName.toLowerCase()} work`
                : "Your CV may need a re-lock to lead with your new function",
            ].map((c) => (
              <li key={c} className="flex gap-3">
                <ArrowRight className="text-maroon-600 mt-0.5 size-5 shrink-0" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {change.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          We could not change your target. Please try again.
        </p>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-navy-400 max-w-xl text-sm">
          Changing target inside the last week before Day 0 is still allowed, but P3 may not be with
          a specialist. We&apos;ll tell you before you confirm.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(ROUTES.student.profile)}>
            Cancel
          </Button>
          <Button
            disabled={!next}
            loading={change.isPending}
            onClick={() => next && change.mutate({ function: next })}
          >
            {`Confirm change to ${nextName ?? "target"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
