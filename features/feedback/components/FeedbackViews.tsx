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
import { useFeedbackDetail, useFeedbackList } from "../hooks/useFeedback";
import { FeedbackNote } from "./FeedbackNote";

/** S10 list. */
export function FeedbackList() {
  const { data, isLoading, isError, refetch } = useFeedbackList();
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Panel feedback</h1>
      {data.items.length === 0 ? (
        <EmptyState
          title="No feedback yet"
          body="Feedback appears here after each mock panel."
          action={
            <Button asChild>
              <Link href={ROUTES.student.sessions}>See Your Sessions</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {data.items.map((f) => (
            <li key={f.panelId}>
              <Link href={ROUTES.student.feedbackPanel(f.panelId)}>
                <Card className="hover:bg-cream-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{f.panelist}</p>
                      <p className="text-navy-400 text-xs">
                        {f.function} · {formatSession(f.startsAt)}
                      </p>
                    </div>
                    <span className="bg-cream-soft rounded-full px-3 py-1 text-xs font-semibold">
                      {f.verdict}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{f.headline}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** S10 detail. */
export function FeedbackDetailView({ panelId }: { panelId: string }) {
  const { data, isLoading, isError, error, refetch } = useFeedbackDetail(panelId);
  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ErrorCard
        title={notFound ? "Feedback not found" : undefined}
        message={notFound ? "That feedback does not exist." : undefined}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <Link
        href={ROUTES.student.feedback}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        All feedback
      </Link>
      <h1 className="font-display text-3xl font-bold">Panel feedback</h1>
      <FeedbackNote
        panelist={data.panelist}
        role={data.function}
        when={formatSession(data.startsAt)}
        verdict={data.verdict}
        note={data.note}
        scores={data.scores}
      />
      {data.sentBackToBuilder && (
        <Card variant="inset" className="text-sm">
          <p className="font-semibold">Your panelist sent you back to the builders</p>
          <p className="text-navy-400">Rework your answers, then rehearse again.</p>
          <div className="mt-3 flex gap-2">
            <Button asChild size="sm">
              <Link href={ROUTES.student.answers}>Open Answers</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={ROUTES.student.cv}>Open CV</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
