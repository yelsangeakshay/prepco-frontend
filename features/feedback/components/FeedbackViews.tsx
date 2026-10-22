"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatDay, formatSession } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useFeedbackDetail, useFeedbackList } from "../hooks/useFeedback";
import type { FeedbackQuestion } from "../schemas";
import { statusTone, type StatusTone } from "@/lib/status";

/** S10 list. */
export function FeedbackList() {
  const { data, isPending, isError, refetch } = useFeedbackList();
  if (isPending) return <PageSkeleton />;
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

const RATING: Record<FeedbackQuestion["rating"], { label: string; tone: StatusTone }> = {
  strong: { label: "Strong", tone: statusTone("strong") },
  flagged: { label: "Flagged", tone: statusTone("flagged") },
  okay: { label: "Okay", tone: statusTone("okay") },
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const link = "text-maroon-600 font-semibold underline";

/** S10 detail: one panel, question by question (s10.png). */
export function FeedbackDetailView({ panelId }: { panelId: string }) {
  const { data, isPending, isError, error, refetch } = useFeedbackDetail(panelId);
  if (isPending) return <PageSkeleton />;
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
  const questions = data.questions ?? [];
  const fixes = data.fixes ?? [];
  const sentBack = questions.filter((q) => q.rating === "flagged").length;
  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:pr-72">
        <PageHeader
          className="md:pr-0"
          eyebrow={
            <>
              <span className="md:hidden">
                {(data.label ?? "Panel").split(" · ")[0]} · {formatDay(data.startsAt)}
              </span>
              <span className="hidden md:inline">
                {data.label ?? "Panel"} · {formatDay(data.startsAt)}
              </span>
            </>
          }
          pill={data.badge ?? undefined}
          pillClassName="hidden md:inline-block"
          title={
            <>
              <span className="md:hidden">Panel feedback</span>
              <span className="hidden md:inline">{data.title ?? "Panel feedback"}</span>
            </>
          }
        />
        <Button
          variant="secondary"
          className="hidden self-start md:inline-flex"
          onClick={() => notify("Report download is not connected in this preview")}
        >
          Download report
        </Button>
      </div>
      <Link href={ROUTES.student.feedback} className={cn(link, "inline-block text-sm")}>
        All feedback
      </Link>

      <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
        <Card variant="feature" className="hidden items-center gap-4 md:flex">
          <span
            aria-hidden
            className="bg-navy-900 flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
          >
            {initials(data.panelist)}
          </span>
          <div>
            <p className="text-xl font-semibold">{data.panelist}</p>
            <p className="text-navy-400">
              {data.panelistBlurb ?? `${data.function} panel`}
              <span className="sr-only"> Verdict: {data.verdict}</span>
            </p>
          </div>
        </Card>
        {data.readiness != null && (
          <Card variant="feature">
            <div className="flex items-baseline justify-between">
              <p className="font-semibold">Ready for Day 0</p>
              <p className="font-num text-4xl font-bold">{data.readiness}%</p>
            </div>
            <ProgressBar className="mt-2" value={data.readiness} label="Readiness for Day 0" />
            {data.readinessNote && (
              <p className="text-navy-400 mt-3 hidden text-sm md:block">{data.readinessNote}</p>
            )}
            <p className="text-navy-400 mt-3 text-sm md:hidden">
              {data.panelist} · {data.function} panel
            </p>
          </Card>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card variant="feature" className="order-2 md:p-8 lg:order-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">Question by question</h2>
            {data.sentBackToBuilder && sentBack > 0 && (
              <Badge tone="goldSoft">{sentBack} sent to your builder</Badge>
            )}
          </div>
          {questions.length === 0 ? (
            <blockquote className="font-display border-gold-500 mt-4 border-l-4 pl-4 text-lg leading-snug">
              {data.note}
            </blockquote>
          ) : (
            <ul className="mt-4">
              {questions.map((q) => (
                <li key={q.question} className="border-line border-t py-5 first:border-t-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{q.question}</h3>
                    <Badge tone={RATING[q.rating].tone} className="shrink-0">
                      {RATING[q.rating].label}
                    </Badge>
                  </div>
                  <p className="text-navy-400 mt-2 hidden md:block">{q.comment}</p>
                  {q.short && <p className="text-navy-400 mt-2 md:hidden">{q.short}</p>}
                  {q.rating === "flagged" && (
                    <div className="mt-3 hidden flex-wrap items-center justify-between gap-2 md:flex">
                      <ul aria-label="Parts to rework" className="flex flex-wrap gap-2">
                        {q.tags.map((t) => (
                          <li
                            key={t}
                            className="bg-cream-soft text-navy-900 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                      {q.answerId && (
                        <Link
                          href={`${ROUTES.student.answers}?a=${q.answerId}`}
                          className={cn(link, "inline-flex min-h-11 items-center text-sm")}
                        >
                          In your builder →
                        </Link>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="contents space-y-4 lg:block">
          {fixes.length > 0 && (
            <Card variant="feature" className="hidden md:block">
              <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
                Fix before P2{data.fixBefore ? ` · ${data.fixBefore}` : ""}
              </p>
              <ol className="mt-3 space-y-3">
                {fixes.map((f, i) => (
                  <li key={f} className="flex gap-3">
                    <span aria-hidden className="font-display text-maroon-600 font-bold">
                      {i + 1}
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
          <Card variant="navy" className="order-1 space-y-3 p-6 lg:order-none">
            <p className="text-gold-300 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Panel&apos;s summary
            </p>
            <blockquote className="font-display text-2xl leading-snug">
              &ldquo;{data.headline}&rdquo;
            </blockquote>
            <p className="hidden text-sm text-white/70 md:block">
              Your P2 panel reads this before they meet you.
            </p>
          </Card>
          {fixes.length > 0 && (
            <Button asChild className="order-3 hidden w-full md:inline-flex lg:order-none">
              <Link href={ROUTES.student.sessions}>Book your P2 slot</Link>
            </Button>
          )}
          {sentBack > 0 && (
            <Button asChild className="order-3 w-full md:hidden">
              <Link href={`${ROUTES.student.answers}?status=flagged`}>Fix flagged answers</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
