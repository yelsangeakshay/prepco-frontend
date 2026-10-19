"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountdownCard } from "@/components/shared/CountdownCard";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { LockedVersionBadge, NeedWorkBadge } from "@/components/shared/Badges";
import { ReadinessMeter } from "@/components/shared/ReadinessMeter";
import { RunwayTimeline } from "@/components/shared/RunwayTimeline";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { formatSession } from "@/lib/utils/dates";
import { useRunway } from "../hooks/useRunway";
import { NextSessionHero } from "./NextSessionHero";
import { RunwayBanner } from "./RunwayBanner";
import { TaskList } from "./TaskList";

/** S5 home. */
export function HomeView() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useRunway();
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const firstName = data.student.name.split(" ")[0];
  const next = data.nextSession;
  const tasks = data.tasks.map((t) => ({ ...t, done: toggled[t.id] ?? t.done }));
  const openStep = data.steps.find((s) => s.status === "pick-slot");

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Hello, {firstName}</h1>
        <p className="text-navy-400 text-sm">
          {data.student.college} · {data.student.target}
        </p>
      </div>

      <RunwayBanner runway={data} />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {next ? (
            <NextSessionHero
              title={next.title}
              when={
                next.startsAt
                  ? next.status === "no-show"
                    ? "Missed"
                    : formatSession(next.startsAt)
                  : ""
              }
              detail={next.panelist ? `With ${next.panelist}` : undefined}
              eyebrow={
                next.status === "cancelled" || next.status === "no-show"
                  ? "Needs attention"
                  : "Next session"
              }
              ctaLabel={
                next.status === "cancelled" || next.status === "no-show"
                  ? "Pick A New Slot"
                  : "View Session"
              }
              onCta={() => router.push(ROUTES.student.session(next.id))}
            />
          ) : (
            <Card
              variant="navy"
              className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-gold-300 text-xs font-semibold tracking-widest uppercase">
                  Next step
                </p>
                <h2 className="font-display mt-1 text-2xl font-bold">
                  {data.doneCount === 0
                    ? "Book your free session"
                    : (openStep?.title ?? "You are all booked")}
                </h2>
              </div>
              <Button asChild variant="onNavy">
                <Link
                  href={
                    data.doneCount === 0
                      ? ROUTES.student.freeSession
                      : openStep?.sessionId
                        ? ROUTES.student.session(openStep.sessionId)
                        : ROUTES.student.sessions
                  }
                >
                  {data.doneCount === 0 ? "Book Free Session" : "Open Runway"}
                </Link>
              </Button>
            </Card>
          )}

          <Card variant="feature">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Your runway</h2>
              <Link
                href={ROUTES.student.sessions}
                className="text-maroon-600 text-sm font-semibold underline"
              >
                All sessions
              </Link>
            </div>
            <RunwayTimeline
              steps={data.steps.map((s) => ({
                id: s.id,
                week: s.week,
                title: s.title,
                when: s.when,
                status: s.status,
              }))}
              onPickSlot={(id) => router.push(ROUTES.student.session(id))}
            />
          </Card>

          <Card>
            <h2 className="font-display mb-2 text-xl font-bold">This week</h2>
            <TaskList
              tasks={tasks}
              onToggle={(id, done) => setToggled((t) => ({ ...t, [id]: done }))}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <CountdownCard days={data.day0.daysLeft} dateLabel={data.day0.label} />
          <Card className="flex justify-center">
            <ReadinessMeter value={data.student.readiness} />
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">CV Builder</h2>
              {data.cv.locked && <LockedVersionBadge version={data.cv.version} />}
            </div>
            <p className="font-display mt-2 text-3xl font-bold">{data.cv.score}</p>
            <Link
              href={ROUTES.student.cv}
              className="text-maroon-600 text-sm font-semibold underline"
            >
              Open CV
            </Link>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Answer bank</h2>
              {data.answers.needWork > 0 && <NeedWorkBadge count={data.answers.needWork} />}
            </div>
            <p className="text-navy-400 mt-2 text-sm">
              {data.answers.prepared} of {data.answers.total} prepared
            </p>
            <Link
              href={ROUTES.student.answers}
              className="text-maroon-600 text-sm font-semibold underline"
            >
              Open answers
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
