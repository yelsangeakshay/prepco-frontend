"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/shell/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProposedBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatDay, formatSession, formatTime } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useBrief, usePanelBriefs } from "../hooks/usePanelist";
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

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function scoreTone(score: number) {
  if (score >= 80) return "bg-green-100 text-green-600";
  if (score >= 70) return "bg-gold-500/15 text-[#7a5c14]";
  return "bg-maroon-100 text-maroon-600";
}

const kicker = "text-maroon-600 text-xs font-semibold tracking-[0.16em] uppercase";

/** P3 detail (p03, p03-mobile): what to pull on, the locked CV and what the last panel found. */
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
  const { student, cv, previousFeedback: prev } = data;
  const kind = data.title.slice(0, 2);
  const start = ROUTES.panelist.scoringSession(sessionId);
  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 pb-8 md:p-8">
      <header className="flex flex-wrap items-start gap-4">
        <Link
          href={ROUTES.panelist.briefs}
          aria-label="All briefs"
          className="text-navy-900 -ml-2 flex size-11 items-center justify-center md:hidden"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </Link>
        <Avatar initials={initials(student.name)} className="hidden size-16 text-lg md:flex" />
        <div className="min-w-0 flex-1">
          <p className={kicker}>
            <span className="hidden md:inline">
              Pre-panel brief · {kind} · {formatSession(data.startsAt).replace(" IST", "")}
            </span>
            <span className="md:hidden">
              {kind} · {formatTime(data.startsAt)}
            </span>
          </p>
          <h1 className="font-display text-2xl leading-tight font-bold md:text-[44px]">
            {student.name}
          </h1>
          <p className="text-navy-400 mt-1 text-sm md:text-base">
            {student.college} · {student.background} · targeting {student.target}
            <span className="md:hidden"> · {student.plan.split(" · ")[0]}</span>
          </p>
        </div>
        <div className="hidden gap-3 self-end md:flex">
          <Button variant="secondary" onClick={() => notify("CV download is not connected yet")}>
            Download locked CV
          </Button>
          <Button asChild>
            <Link href={start}>Start panel</Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,330px)] md:gap-6">
        <div className="contents md:flex md:flex-col md:gap-6">
          <Card variant="feature" className="order-2 p-5 md:order-none md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold md:text-2xl">
                <span className="hidden md:inline">Pull on these</span>
                <span className="text-maroon-600 font-sans text-xs font-semibold tracking-[0.16em] uppercase md:hidden">
                  Pull on these
                </span>
              </h2>
              <span className="bg-maroon-100 text-maroon-600 hidden rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase md:inline">
                From {kind === "P1" ? "the CV" : "P1 + the CV"}
              </span>
            </div>
            <ol className="mt-3 md:mt-5">
              {data.answersToProbe.map((a, n) => (
                <li
                  key={a.question}
                  className="border-line flex gap-3 border-t py-4 first:border-t-0 md:gap-4"
                >
                  <span
                    aria-hidden
                    className="font-display text-maroon-600 w-4 pt-0.5 text-lg font-bold"
                  >
                    {n + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold md:text-lg">
                      <span>&ldquo;{a.question}&rdquo;</span>
                      <Badge
                        tone={a.status === "flagged" ? "maroonSoft" : "neutral"}
                        className="md:hidden"
                      >
                        {a.status === "flagged" ? "Flagged" : "Not drafted"}
                      </Badge>
                    </p>
                    <p className="text-navy-400 hidden text-base md:block">{a.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card variant="feature" className="order-3 p-5 md:order-none md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold md:text-2xl">
                <span className="hidden md:inline">Locked CV · work experience</span>
                <span className="text-maroon-600 font-sans text-xs font-semibold tracking-[0.16em] uppercase md:hidden">
                  Locked CV
                </span>
              </h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold tracking-wider text-green-600 uppercase">
                <span className="hidden md:inline">
                  {cv.version} · Locked · Score {cv.score}
                </span>
                <span className="md:hidden">
                  {cv.version} · {cv.score}
                </span>
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {cv.bullets.map((b, n) => (
                <li
                  key={b.text}
                  className={cn(
                    "bg-cream-soft items-start gap-4 rounded-xl px-4 py-3 md:flex",
                    n > 0 && "hidden",
                  )}
                >
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full px-3 py-1 text-xs font-bold md:inline",
                      scoreTone(b.score),
                    )}
                    aria-label={`Bullet score ${b.score}`}
                  >
                    {b.score}
                  </span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="contents md:flex md:flex-col md:gap-4">
          {prev && (
            <Card variant="feature" className="order-1 md:order-none">
              <p className={cn(kicker, "hidden md:block")}>
                {kind === "P1" ? "Last panel" : "P1"} · {formatDay(prev.startsAt)} · {prev.panelist}
              </p>
              <div className="mt-1 flex items-center justify-between gap-3 md:mt-3">
                <p className="font-semibold">
                  <span className="hidden md:inline">Ready for Day 0</span>
                  <span className="md:hidden">P1 readiness</span>
                </p>
                <p className="font-semibold">{student.readiness}%</p>
              </div>
              <ProgressBar value={student.readiness} label="P1 readiness" className="mt-2" />
              <p className="mt-3 md:text-lg">&ldquo;{prev.headline}&rdquo;</p>
            </Card>
          )}
          <Card variant="feature" className="order-4 md:order-none">
            <p className={kicker}>
              <span className="hidden md:inline">
                Profiling call notes · {data.profilingNotes.dateLabel}
              </span>
              <span className="md:hidden">Profiling notes</span>
            </p>
            <p className="mt-2 md:text-lg">{data.profilingNotes.text}</p>
          </Card>
          <Card variant="feature" className="order-5 hidden md:order-none md:block">
            <p className={kicker}>Since {kind === "P1" ? "joining" : "P1"}</p>
            <p className="mt-2 md:text-lg">{data.sinceLastPanel}</p>
          </Card>
          {kind === "P2" && (
            <div className="bg-cream-soft order-6 hidden rounded-2xl p-6 md:order-none md:block">
              <p className={kicker}>Co-interviewing</p>
              <p className="mt-2 md:text-lg">
                A Prep Co panel lead joins this P2 with you. <ProposedBadge />
              </p>
            </div>
          )}
        </div>
      </div>

      <Button asChild className="w-full md:hidden">
        <Link href={start}>Start panel</Link>
      </Button>
    </div>
  );
}
