"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ProposedBadge } from "@/components/shared/Badges";
import { Skeleton } from "@/components/shared/Skeletons";
import { FUNCTIONS } from "@/features/onboarding/schemas";
import { ROUTES } from "@/lib/config/routes";
import { useQuickSwitch } from "../hooks/useJourney";

/** S13 Quick Switch: see how much of your prep carries over before you change target. */
export function QuickSwitchView() {
  const [to, setTo] = useState<string | null>(null);
  const q = useQuickSwitch(to);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Quick Switch</h1>
        <ProposedBadge />
      </div>
      <p className="text-navy-400 text-sm">
        Thinking of a different function? See how much of your prep carries over. Nothing changes
        until you confirm.
      </p>

      <Card variant="feature">
        <FormField id="qs-to" label="Compare with">
          <select
            id="qs-to"
            value={to ?? ""}
            onChange={(e) => setTo(e.target.value || null)}
            className="rounded-control border-line min-h-11 w-full border bg-white px-3 text-sm"
          >
            <option value="">Select a function</option>
            {FUNCTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </FormField>
      </Card>

      {to && q.isPending && <Skeleton className="h-40 w-full" />}
      {to && q.isError && <ErrorCard onRetry={() => q.refetch()} />}
      {q.data && to && (
        <Card variant="feature" data-testid="quick-switch-result">
          <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
            {q.data.from} to {q.data.to}
          </p>
          <p className="font-display mt-1 text-4xl font-bold">
            {q.data.reusableAnswers}
            <span className="text-navy-400 text-xl font-normal">
              {" "}
              of {q.data.totalAnswers} answers carry over
            </span>
          </p>
          <ProgressBar
            className="mt-3"
            value={q.data.reusableAnswers}
            max={q.data.totalAnswers}
            label="Answers that carry over"
          />
          <p className="mt-3 text-sm">{q.data.cvBulletsToReframe} CV bullets to reframe.</p>
          {q.data.gaps.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {q.data.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
          <Button asChild className="mt-5">
            <Link href={ROUTES.student.profileChangeTarget}>Continue To Change Target</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
