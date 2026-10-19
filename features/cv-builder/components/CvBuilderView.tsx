"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { LockedVersionBadge } from "@/components/shared/Badges";
import { ScoreBar } from "@/components/shared/ScoreBar";
import { PageSkeleton, Skeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { formatDay } from "@/lib/utils/dates";
import { useCv } from "../hooks/useCv";
import { BulletEditor } from "./BulletEditor";
import { RelockDialog } from "./RelockDialog";

const CvPreview = dynamic(() => import("./CvPreview"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

/** S6 CV Builder. */
export function CvBuilderView() {
  const { data, isLoading, isError, refetch } = useCv();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const { draft, locked, relock } = data;

  if (draft.sections.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <h1 className="font-display text-3xl font-bold">CV Builder</h1>
        <div className="mt-6">
          <EmptyState
            title="No CV yet"
            body="Upload your CV and we will split it into bullets you can sharpen."
            action={
              <Button asChild>
                <Link href={ROUTES.student.onboardingCv}>Upload CV</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold">CV Builder</h1>
          {locked.version && <LockedVersionBadge version={locked.version} />}
        </div>
        <Button asChild variant="secondary">
          <Link href={ROUTES.student.cvVersions}>Versions</Link>
        </Button>
      </div>

      {locked.version && (
        <Card
          variant="inset"
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <p className="flex items-start gap-2 text-sm">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <strong>{locked.version}</strong> is locked
              {locked.lockedAt ? ` since ${formatDay(locked.lockedAt)}` : ""} and is what your
              panelists see. Edit the draft below and request a re-lock when it is ready.
            </span>
          </p>
          {relock.status === "pending" ? (
            <p role="status" className="text-sm font-semibold">
              Re-lock requested{relock.requestedAt ? ` on ${formatDay(relock.requestedAt)}` : ""}
            </p>
          ) : (
            <RelockDialog />
          )}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {draft.sections.map((s) => (
            <section key={s.id} aria-labelledby={`sec-${s.id}`}>
              <h2 id={`sec-${s.id}`} className="font-display mb-2 text-xl font-bold">
                {s.title}
              </h2>
              <div className="space-y-3">
                {s.bullets.map((b) => (
                  <BulletEditor key={b.id} bullet={b} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <Card variant="feature" aria-label="Draft score">
            <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
              {draft.version} score
            </p>
            <p data-testid="overall-score" className="font-display mt-1 text-5xl font-bold">
              {draft.scores.overall}
            </p>
            {locked.scores && (
              <p className="text-navy-400 text-xs">
                {locked.version} scored {locked.scores.overall}
              </p>
            )}
            <div className="mt-4 space-y-3">
              <ScoreBar label="Impact" value={draft.scores.impact} />
              <ScoreBar label="Clarity" value={draft.scores.clarity} />
              <ScoreBar label="Defensibility" value={draft.scores.defensibility} />
            </div>
          </Card>
          <div className="hidden lg:block">
            <CvPreview cv={data} />
          </div>
        </aside>
      </div>
    </div>
  );
}
