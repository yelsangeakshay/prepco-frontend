"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatSession } from "@/lib/utils/dates";
import { useBrief, usePanelBriefs } from "../hooks/usePanelist";
import type { Brief } from "../schemas";
import { PanelRow } from "./PanelRow";

/** P3 list. */
export function BriefList() {
  const { data, isPending, isError, refetch } = usePanelBriefs();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Pre-panel briefs</h1>
      {data.items.length === 0 ? (
        <EmptyState
          title="No briefs yet"
          body="A brief appears here once ops assigns you a panel."
        />
      ) : (
        data.items.map((i) => <PanelRow key={i.sessionId} item={i} />)
      )}
    </div>
  );
}

/** The brief itself; reused beside the scoring form on P4. */
export function BriefBody({ brief }: { brief: Brief }) {
  const { student } = brief;
  return (
    <div className="space-y-4">
      <Card variant="feature">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
          {brief.title}
        </p>
        <h2 className="font-display mt-1 text-2xl font-bold">{student.name}</h2>
        <p className="text-sm">
          {student.college} · {student.track} track · targeting {student.target}
        </p>
        <p className="text-navy-400 text-sm">{student.background}</p>
        <p className="mt-2 text-sm font-semibold">{formatSession(brief.startsAt)}</p>
        <p className="mt-1 text-sm">
          Readiness <strong>{student.readiness}%</strong>
        </p>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-bold">CV highlights</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {brief.cvHighlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-bold">Probe these answers</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {brief.answersToProbe.map((a) => (
            <li key={a.question} className="bg-maroon-100 rounded-control p-3">
              <p className="font-semibold">{a.question}</p>
              <p className="text-maroon-600">{a.why}</p>
            </li>
          ))}
        </ul>
      </Card>

      {brief.previousFeedback && (
        <Card variant="inset">
          <p className="text-sm font-semibold">
            Last panel: {brief.previousFeedback.verdict} ({brief.previousFeedback.panelist})
          </p>
          <p className="text-navy-400 text-sm">{brief.previousFeedback.headline}</p>
        </Card>
      )}

      <Card>
        <h3 className="font-display text-lg font-bold">Suggested questions</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {brief.suggestedQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

/** P3 detail. */
export function BriefDetail({ sessionId }: { sessionId: string }) {
  const { data, isPending, isError, error, refetch } = useBrief(sessionId);
  if (isPending) return <PageSkeleton />;
  if (isError || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ErrorCard
        title={notFound ? "Brief not found" : undefined}
        message={notFound ? "That brief is not assigned to you." : undefined}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <Link
        href={ROUTES.panelist.briefs}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        All briefs
      </Link>
      <h1 className="font-display text-3xl font-bold">Brief: {data.student.name}</h1>
      <BriefBody brief={data} />
      <Button asChild className="w-full sm:w-auto">
        <Link href={ROUTES.panelist.scoringSession(sessionId)}>Start Scoring</Link>
      </Button>
    </div>
  );
}
