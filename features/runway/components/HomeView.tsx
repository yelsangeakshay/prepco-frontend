"use client";

import { useState } from "react";
import Link from "next/link";
import { useNavigate } from "@/lib/nav/useNavigate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { FlaggedBadge, LockedVersionBadge, NeedWorkBadge } from "@/components/shared/Badges";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RunwayTimeline } from "@/components/shared/RunwayTimeline";
import { ScoreBar } from "@/components/shared/ScoreBar";
import { HomeSkeleton } from "@/components/shared/PageSkeletons";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/config/routes";
import { daysUntil, formatSession } from "@/lib/utils/dates";
import { now } from "@/lib/utils/clock";
import { useRunway } from "../hooks/useRunway";
import { FirstLoginHome, SecondSeasonHome } from "./HomeStates";
import { RunwayBanner } from "./RunwayBanner";
import { TaskList } from "./TaskList";
import type { Runway } from "../schemas";

const link = "text-maroon-600 text-[15px] font-semibold underline underline-offset-4";
const eyebrow = "text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase";

function Glow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-16 -left-10 size-72 rounded-full bg-[var(--maroon-600)]/35 blur-3xl"
    />
  );
}

function Hero({ data }: { data: Runway }) {
  const { navigate } = useNavigate();
  const next = data.nextSession;
  const attention = next && (next.status === "cancelled" || next.status === "no-show");

  if (!next) {
    const open = data.steps.find((s) => s.status === "pick-slot");
    return (
      <Card variant="navy" className="relative overflow-hidden p-6 md:p-8">
        <Glow />
        <p className="text-gold-300 relative text-[13px] font-semibold tracking-[0.16em] uppercase">
          Next step
        </p>
        <h2 className="font-display relative mt-4 text-3xl leading-tight font-bold md:text-[40px]">
          {data.doneCount === 0 ? "Book your free session" : (open?.title ?? "You are all booked")}
        </h2>
        <Button asChild variant="onNavy" className="relative mt-6 w-full md:w-auto">
          <Link
            href={
              data.doneCount === 0
                ? ROUTES.student.freeSession
                : open?.sessionId
                  ? ROUTES.student.session(open.sessionId)
                  : ROUTES.student.sessions
            }
          >
            {data.doneCount === 0 ? "Book Free Session" : "Open Runway"}
          </Link>
        </Button>
      </Card>
    );
  }

  const days = next.startsAt ? daysUntil(next.startsAt, now()) : null;
  const week = data.steps.find((s) => s.sessionId === next.id)?.week.toUpperCase() ?? "";
  const title = next.kind === "deep-dive" ? `${next.title} with a practitioner` : next.title;
  const sub = next.startsAt
    ? next.status === "no-show"
      ? "Missed"
      : `${formatSession(next.startsAt)}${next.panelFunction ? ` · run by a ${next.panelFunction} practitioner` : ""}`
    : "";

  return (
    <Card variant="navy" className="relative flex flex-col overflow-hidden p-6 md:p-8">
      <Glow />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-gold-300 text-[13px] font-semibold tracking-[0.16em] uppercase">
          {attention ? "Needs attention" : `Next up · ${week}`}
        </p>
        {!attention && days !== null && days >= 0 && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap uppercase max-md:hidden">
            In {days} {days === 1 ? "day" : "days"}
          </span>
        )}
      </div>
      <h2 className="font-display relative mt-5 text-3xl leading-tight font-bold md:text-[40px]">
        {title}
      </h2>
      <p className="relative mt-3 text-base text-white/70 md:text-lg">{sub}</p>
      <div className="relative mt-6 flex flex-col gap-3 sm:flex-row md:mt-auto md:pt-6">
        <Button variant="onNavy" onClick={() => navigate(ROUTES.student.session(next.id))}>
          {attention ? "Pick A New Slot" : "Session Details"}
        </Button>
        {data.answers.needWork > 0 && !attention && (
          <Button
            variant="ghost"
            className="border border-white/30 text-white hover:bg-white/10 max-md:hidden"
            onClick={() => navigate(`${ROUTES.student.answers}?status=flagged`)}
          >
            Prep: {data.answers.needWork} answers need work
          </Button>
        )}
      </div>
    </Card>
  );
}

function DayZero({ data }: { data: Runway }) {
  return (
    <Card variant="feature" className="flex h-full flex-col p-6 md:p-7">
      <p className={eyebrow}>Day 0</p>
      <p className="font-num mt-6 text-[88px] leading-none font-bold">{data.day0.daysLeft}</p>
      <p className="text-navy-400 mt-1 text-lg">days · {data.day0.label} 2026</p>
      <p className="mt-auto pt-6 text-[15px]">
        {data.day0.movedFrom
          ? `Day 0 moved from ${data.day0.movedFrom}.`
          : "Day 0 doesn't move for anyone."}
      </p>
    </Card>
  );
}

function RunwayCard({ data }: { data: Runway }) {
  const { navigate } = useNavigate();
  return (
    <Card variant="feature" className="p-6 md:p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Runway to The Day</h2>
        <Link href={ROUTES.student.sessions} className={link}>
          Open runway →
        </Link>
      </div>
      <RunwayTimeline
        orientation="horizontal"
        steps={data.steps.map((s) => ({
          id: s.id,
          week: s.week,
          title: s.title,
          when: s.when,
          status: s.status,
        }))}
        onPickSlot={(id) => navigate(ROUTES.student.session(id))}
      />
    </Card>
  );
}

function CvCard({ data }: { data: Runway }) {
  const cv = data.cv;
  return (
    <Card variant="feature" className="p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className={eyebrow}>CV Builder</h2>
        {cv.locked && <LockedVersionBadge version={cv.version} />}
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-num text-6xl leading-none font-bold">{cv.score}</span>
        <span className="text-navy-400">/100 · Interview-defensible</span>
      </p>
      <div className="mt-4 space-y-3">
        <ScoreBar label="Impact" value={cv.impact} />
        <ScoreBar label="Clarity" value={cv.clarity} />
        <ScoreBar label="Defensibility" value={cv.defensibility} />
      </div>
      <Link href={ROUTES.student.cv} className={cn(link, "mt-5 inline-block")}>
        Open CV Builder →
      </Link>
    </Card>
  );
}

function AnswersCard({ data }: { data: Runway }) {
  const a = data.answers;
  const tiles: [number, string, boolean][] = [
    [a.total, "Questions", false],
    [a.prepared, "Prepared", false],
    [a.needWork, "Need work", true],
  ];
  return (
    <Card variant="feature" className="p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className={eyebrow}>Answer bank</h2>
        {a.needWork > 0 && <NeedWorkBadge count={a.needWork} />}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {tiles.map(([n, label, warn]) => (
          <div
            key={label}
            className={cn(
              "rounded-card px-2 py-4 text-center",
              warn ? "bg-maroon-100" : "bg-cream-soft",
            )}
          >
            <p className={cn("font-num text-3xl font-bold", warn && "text-maroon-600")}>{n}</p>
            <p className="text-navy-400 mt-1 text-sm">{label}</p>
          </div>
        ))}
      </div>
      {a.flagged && (
        <p className="mt-4 text-[15px] leading-snug">
          <FlaggedBadge /> <span className="ml-1">{a.flagged}</span>
        </p>
      )}
      <Link href={ROUTES.student.answers} className={cn(link, "mt-5 inline-block")}>
        Open answer bank →
      </Link>
    </Card>
  );
}

function LatestPanel({ data }: { data: Runway }) {
  const p = data.latestPanel;
  return (
    <Card variant="feature" className="p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className={eyebrow}>Latest panel{p ? ` · ${p.label}` : ""}</h2>
        {p && <span className="text-navy-400 text-sm">{p.date}</span>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="font-semibold">Ready for Day 0</p>
        <p className="text-lg font-semibold">{data.student.readiness}%</p>
      </div>
      <ProgressBar className="mt-2" value={data.student.readiness} label="Readiness for Day 0" />
      {p ? (
        <>
          <p className="text-navy-400 mt-4 text-[15px] leading-relaxed">&ldquo;{p.quote}&rdquo;</p>
          <p className="mt-3 text-[15px]">{p.panelistLine}</p>
          <Link
            href={ROUTES.student.feedbackPanel(p.feedbackId)}
            className={cn(link, "mt-5 inline-block")}
          >
            Read full feedback →
          </Link>
        </>
      ) : (
        <p className="text-navy-400 mt-4 text-[15px]">Your first panel feedback will show here.</p>
      )}
    </Card>
  );
}

function QuickSwitchCard() {
  return (
    <Card variant="feature" className="flex flex-col p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className={eyebrow}>Quick Switch</h2>
        <Badge tone="neutral">For Route Four</Badge>
      </div>
      <p className="mt-4 text-[17px] leading-snug">
        An agent that job-hunts while you don&apos;t. Off for now, since you&apos;re on campus.
      </p>
      <p className="text-navy-400 mt-3">Free, and on for as long as you&apos;re looking.</p>
      <Button asChild variant="secondary" className="mt-auto w-full">
        <Link href={ROUTES.student.quickSwitch}>Set up Quick Switch</Link>
      </Button>
    </Card>
  );
}

/** Phone (s05-mobile.png): compact cards instead of the full desktop grid. */
function MobileHome({ data }: { data: Runway }) {
  const open = data.steps.find((s) => s.status === "pick-slot");
  return (
    <div className="space-y-4 md:hidden">
      <Card variant="feature" className="p-5">
        <div className="flex items-baseline justify-between">
          <h2 className={eyebrow}>Runway</h2>
          <p className="text-navy-400 text-sm">
            {data.doneCount} of {data.totalCount} done
          </p>
        </div>
        <ol className="mt-3 flex gap-1.5" aria-label="Runway progress">
          {data.steps.map((s) => (
            <li
              key={s.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                s.status === "done"
                  ? "bg-maroon-600"
                  : s.status === "next"
                    ? "bg-gold-500"
                    : "bg-line",
              )}
            />
          ))}
        </ol>
        {open && (
          <p className="mt-3 text-[15px]">
            Next: {open.title} ·{" "}
            <Link href={ROUTES.student.session(open.sessionId ?? open.id)} className={link}>
              pick a slot
            </Link>
          </p>
        )}
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card variant="feature" className="p-5">
          <h2 className={eyebrow}>CV score</h2>
          <p className="font-num mt-2 text-5xl leading-none font-bold">{data.cv.score}</p>
          {data.cv.locked && (
            <div className="mt-3">
              <LockedVersionBadge version={data.cv.version} />
            </div>
          )}
        </Card>
        <Card variant="feature" className="p-5">
          <h2 className={eyebrow}>Answers</h2>
          <p className="font-num mt-2 text-5xl leading-none font-bold">
            {data.answers.prepared}
            <span className="text-navy-400 text-2xl font-normal">/{data.answers.total}</span>
          </p>
          {data.answers.needWork > 0 && (
            <div className="mt-3">
              <NeedWorkBadge count={data.answers.needWork} />
            </div>
          )}
        </Card>
      </div>
      <Card variant="feature" className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold">
            Ready for Day 0{data.latestPanel ? ` · after ${data.latestPanel.label}` : ""}
          </p>
          <p className="text-lg font-semibold">{data.student.readiness}%</p>
        </div>
        <ProgressBar className="mt-2" value={data.student.readiness} label="Readiness for Day 0" />
      </Card>
    </div>
  );
}

/** S5 home (s05.png). */
export function HomeView() {
  const { data, isPending, isError, refetch } = useRunway();
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (isPending) return <HomeSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  // Two states have their own page (e12.png, e11.png).
  if (data.banner === "first-login" && data.doneCount === 0) return <FirstLoginHome data={data} />;
  if (data.secondSeason) return <SecondSeasonHome data={data} />;

  const firstName = data.student.name.split(" ")[0];
  const tasks = data.tasks.map((t) => ({ ...t, done: toggled[t.id] ?? t.done }));
  const week = data.steps.find((s) => s.status === "next" || s.status === "pick-slot")?.week ?? "";

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8 xl:px-10">
      <div className="flex items-end justify-between gap-4 md:block">
        <PageHeader
          eyebrow={
            <>
              <span className="max-md:hidden">Mon 5 Oct · </span>
              {week} · {data.student.track} track
            </>
          }
          title={`Good evening, ${firstName}.`}
        />
        <p className="text-navy-400 shrink-0 pb-1 text-right text-sm md:hidden">
          <span className="font-num text-navy-900 block text-4xl leading-none font-bold">
            {data.day0.daysLeft}
          </span>
          days to Day 0
        </p>
      </div>

      <RunwayBanner runway={data} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Hero data={data} />
        <div className="max-md:hidden">
          <DayZero data={data} />
        </div>
      </div>

      <div className="max-md:hidden">
        <RunwayCard data={data} />
      </div>
      <MobileHome data={data} />

      <div className="grid gap-6 max-md:hidden lg:grid-cols-3">
        <CvCard data={data} />
        <AnswersCard data={data} />
        <LatestPanel data={data} />
      </div>

      <div className="grid gap-6 max-md:hidden lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <Card variant="feature" className="p-6 md:p-7">
          <h2 className="font-display mb-2 text-2xl font-bold">This week</h2>
          <TaskList
            tasks={tasks}
            onToggle={(id, done) => setToggled((t) => ({ ...t, [id]: done }))}
          />
        </Card>
        <QuickSwitchCard />
      </div>
    </div>
  );
}
