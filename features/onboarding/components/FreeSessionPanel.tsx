"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { SlotPicker } from "@/features/runway/components/SlotPicker";
import { useBookSession } from "@/features/runway/hooks/useRunway";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { now } from "@/lib/utils/clock";
import { cn } from "@/lib/utils/cn";
import { formatDay, formatDayYear, formatSession, formatTime } from "@/lib/utils/dates";
import { useFreeSession } from "../hooks/useOnboarding";
import type { FreeSummary } from "../schemas";

const COVER = [
  "We read your CV line by line and mark what a panel will pull on.",
  "You answer two questions the way you would in the room.",
  "We name 3 roles your profile is competitive for.",
  "You get a written summary and suggested runway.",
];

const eyebrow = "text-maroon-600 text-xs font-semibold tracking-[0.18em] uppercase";

function Pill({
  tone,
  children,
}: {
  tone: "green" | "maroon" | "gold" | "grey";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold tracking-wider whitespace-nowrap uppercase",
        tone === "green" && "bg-green-100 text-green-600",
        tone === "maroon" && "bg-maroon-100 text-maroon-600",
        tone === "gold" && "bg-gold-300/40 text-navy-900",
        tone === "grey" && "bg-cream-soft text-navy-900",
      )}
    >
      {children}
    </span>
  );
}

/** Downloads a one-event calendar file for the booked slot. */
function downloadIcs(startsIso: string) {
  const start = new Date(startsIso);
  const end = new Date(start.getTime() + 30 * 60_000);
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Prep Co//Free session//EN",
    "BEGIN:VEVENT",
    `UID:free-session-${stamp(start)}@theprepco`,
    `DTSTAMP:${stamp(now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    "SUMMARY:The Prep Co free session",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "prep-co-free-session.ics";
  a.click();
  URL.revokeObjectURL(url);
}

/** Left column: the session itself, then what the 30 minutes cover. */
function SessionCard({ startsAt, completed }: { startsAt: string; completed: boolean }) {
  return (
    <Card variant="feature" className="p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-maroon-600 text-xs font-semibold tracking-[0.12em] whitespace-nowrap uppercase">
          Your free session
        </h2>
        <Pill tone={completed ? "green" : "gold"}>{completed ? "Completed" : "Booked"}</Pill>
      </div>
      <p className="font-display mt-5 text-[28px] leading-tight font-bold">
        {formatDayYear(startsAt)}
      </p>
      <p className="text-navy-400 mt-1">{formatTime(startsAt)} IST · 30 min · video call</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone="grey">Free</Pill>
        <Pill tone="grey">No card required</Pill>
        <Pill tone="grey">Written summary after</Pill>
      </div>
      <p className="text-navy-400 mt-4 text-sm">
        Booked through Calendly. The call link and reminders arrive by email.
      </p>
      <div className="mt-5 space-y-3">
        <Button variant="secondary" className="w-full" onClick={() => downloadIcs(startsAt)}>
          Add to calendar
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href={ROUTES.student.sessions}>Reschedule</Link>
        </Button>
      </div>
    </Card>
  );
}

function CoverCard() {
  return (
    <Card variant="feature" className="p-7">
      <h2 className={eyebrow}>What we cover in 30 minutes</h2>
      <ul className="mt-5 space-y-4">
        {COVER.map((line) => (
          <li key={line} className="flex gap-3 text-[15px] leading-relaxed">
            <Check className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
            {line}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** The written summary a student keeps after the session (s03.png). */
function Summary({ data, startsAt }: { data: FreeSummary; startsAt: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 lg:block">
        <p className={eyebrow}>
          <span className="lg:hidden">Free session · {formatDay(startsAt).toUpperCase()}</span>
          <span className="hidden lg:inline">Session summary · yours to keep</span>
        </p>
        <span className="lg:hidden">
          <Pill tone="green">Completed</Pill>
        </span>
      </div>
      <h1 className="font-display text-navy-900 mt-3 text-[32px] leading-tight font-bold lg:text-[48px]">
        {data.headline}
      </h1>
      <p className="text-navy-400 mt-4 max-w-3xl text-lg leading-relaxed">
        <span className="lg:hidden">{data.ledeShort}</span>
        <span className="max-lg:hidden">{data.lede}</span>
      </p>

      <Card variant="feature" className="mt-8 p-5 lg:p-6">
        <h2 className={eyebrow}>{data.roles.length} roles your profile is competitive for</h2>
        <ul className="mt-4 grid gap-3 lg:grid-cols-3">
          {data.roles.map((r) => (
            <li key={r.title} className="lg:bg-cream rounded-card lg:p-4">
              <p className="text-lg font-semibold lg:text-base">{r.title}</p>
              <p className="text-navy-400 text-sm max-lg:hidden">{r.note}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="feature" className="mt-6 p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className={eyebrow}>
            CV markup<span className="max-lg:hidden"> · what a panel will pull on</span>
          </h2>
          <Pill tone="gold">{data.markups.length} marked</Pill>
        </div>
        <ul className="mt-4 space-y-3">
          {data.markups.map((m, i) => (
            <li
              key={m.quote}
              className={cn("rounded-card border-line p-4 lg:border", i > 0 && "max-lg:hidden")}
            >
              <p>“{m.quote}”</p>
              <p className="text-maroon-600 mt-2 text-sm">
                <strong>Panel will ask:</strong> <span className="lg:hidden">{m.askShort}</span>
                <span className="max-lg:hidden">{m.ask}</span>
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="feature" className="mt-6 p-5 lg:p-6">
        <h2 className={eyebrow}>
          Your two answers<span className="max-lg:hidden"> · how they landed</span>
        </h2>
        <ul className="mt-3 divide-y divide-[var(--line)]">
          {data.answers.map((a) => (
            <li key={a.question} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{a.question}</p>
                <Pill tone={a.verdict === "landed" ? "green" : "maroon"}>
                  {a.verdict === "landed" ? "Landed" : "Needs work"}
                </Pill>
              </div>
              <p className="text-navy-400 mt-2 text-sm max-lg:hidden">{a.note}</p>
            </li>
          ))}
        </ul>
      </Card>

      <section className="rounded-feature bg-navy-900 mt-6 p-6 text-white lg:p-8">
        <h2 className="text-gold-300 text-xs font-semibold tracking-[0.18em] uppercase">
          Suggested runway
        </h2>
        <p className="font-display mt-3 max-w-2xl text-2xl leading-snug font-bold lg:text-[28px]">
          {data.runway}
        </p>
        <p className="mt-3 text-white/70 max-lg:hidden">
          If you don&apos;t need the plan, this summary still stands. We&apos;d rather tell you that
          for free.
        </p>
        <Button asChild variant="onNavy" className="mt-5 max-lg:w-full">
          <Link href={ROUTES.student.plans}>
            See plans <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </section>
    </>
  );
}

/** S3: pick a slot, booked, or the summary after the session (s03.png). E12: the same page when the session is used. */
export function FreeSessionPanel() {
  const { data, isPending, isError, refetch } = useFreeSession();
  const book = useBookSession("free");

  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const frame = (left: ReactNode, main: ReactNode) => (
    <div className="mx-auto max-w-[1200px] p-5 lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10 lg:p-10">
      <div className="space-y-5 max-lg:hidden">{left}</div>
      <div className="min-w-0">{main}</div>
    </div>
  );

  const bookedAt = book.isSuccess ? book.data.startsAt : data.usedAt;

  if (book.isSuccess || (!data.eligible && bookedAt && new Date(bookedAt) > now())) {
    return frame(
      <>
        <SessionCard startsAt={bookedAt!} completed={false} />
        <CoverCard />
      </>,
      <Card variant="feature" className="text-center">
        <CalendarCheck className="mx-auto size-10 text-green-600" aria-hidden />
        <h1 className="font-display mt-3 text-2xl font-bold">You are booked</h1>
        <p className="text-navy-400 mt-1 text-sm">{formatSession(bookedAt!)}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={ROUTES.student.plans}>See Plans</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.student.home}>Go To Home</Link>
          </Button>
        </div>
      </Card>,
    );
  }

  if (!data.eligible && data.usedAt) {
    return frame(
      <>
        <SessionCard startsAt={data.usedAt} completed />
        <CoverCard />
      </>,
      data.summary ? (
        <Summary data={data.summary} startsAt={data.usedAt} />
      ) : (
        <Card variant="feature">
          <h1 className="font-display text-2xl font-bold">Free session already used</h1>
          <p className="text-navy-400 mt-1 text-sm">Pick a plan to keep going.</p>
        </Card>
      ),
    );
  }

  const slotTaken = book.error instanceof ApiError && book.error.code === "slot_taken";

  return frame(
    <CoverCard />,
    <>
      <p className={eyebrow}>Free session · 30 minutes</p>
      <h1 className="font-display mt-3 text-[32px] leading-tight font-bold lg:text-[44px]">
        Your free session
      </h1>
      <p className="text-navy-400 mt-3 mb-6 text-lg">
        A 30-minute call to understand your goals. Pick an evening slot (IST).
      </p>
      <SlotPicker
        slots={data.slots}
        slotTakenError={slotTaken}
        confirming={book.isPending}
        onConfirm={(id) => book.mutate(id, { onError: () => refetch() })}
      />
      {book.isError && !slotTaken && (
        <p role="alert" className="text-maroon-600 mt-3 text-sm">
          Booking failed. Please try again.
        </p>
      )}
    </>,
  );
}
