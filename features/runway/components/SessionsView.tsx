"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { formatDay, formatTime } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useBookSession, useRunway, useSessionSlots, useSessions } from "../hooks/useRunway";
import type { Session, SlotDto } from "../schemas";
import { RunwayBanner } from "./RunwayBanner";
import { SessionStatusBadge } from "./SessionStatusBadge";

/** Top-up price per mock panel at each plan's rate (s09.png, s04.png). */
const TOP_UP: Record<string, number> = { Basic: 1799, Premium: 1299, Elite: 999 };

const needsSlot = (s: Session) => ["unbooked", "cancelled", "no-show"].includes(s.status);

/** "Mon 12 Oct · 7:30 PM IST" -> "Mon 12 Oct · 7:30 PM". */
const chipLabel = (s: SlotDto) => s.label.replace(/ IST$/, "");
/** "Mon 12 Oct · 7:30 PM IST" -> "Mon 12 Oct, 7:30 PM". */
const confirmLabel = (s: SlotDto) => chipLabel(s).replace(" · ", ", ");
/** Phone chips drop the date, as drawn: "Mon 7:30 PM". */
const shortChip = (s: SlotDto) =>
  `${formatDay(s.startsAt).split(" ")[0]} ${formatTime(s.startsAt)}`;

/** Inline slot choice for the first open session (s09.png): chips, then one confirm button. */
function InlineSlots({ session, priority }: { session: Session; priority: boolean }) {
  const slots = useSessionSlots(session.id);
  const book = useBookSession(session.id);
  const [chosen, setChosen] = useState<string | null>(null);
  const items = (slots.data?.items ?? []).filter((s) => !s.taken);
  // s09.png draws the second slot chosen.
  const selected = items.find((s) => s.id === chosen) ?? items[1] ?? items[0];
  const slotTaken = book.error instanceof ApiError && book.error.code === "slot_taken";

  if (slots.isPending) {
    return (
      <p role="status" className="text-navy-400 mt-3 text-sm">
        Loading slots…
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="text-navy-400 mt-3 text-sm">No slots open. New ones arrive every Monday.</p>
    );
  }
  return (
    <div className="mt-3">
      {slotTaken && (
        <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-control mb-3 p-3 text-sm">
          That slot was just taken. Please pick another.
        </p>
      )}
      <div role="radiogroup" aria-label="Available slots" className="flex flex-wrap gap-2">
        {items.map((s) => {
          const on = s.id === selected?.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setChosen(s.id)}
              className={cn(
                "rounded-control min-h-11 cursor-pointer border px-4 text-sm font-medium",
                on ? "border-maroon-600 bg-maroon-600 text-white" : "border-line bg-white",
              )}
            >
              <span className="md:hidden">{shortChip(s)}</span>
              <span className="hidden md:inline">{chipLabel(s)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {priority ? (
          <p className="text-navy-400 text-sm">
            Priority slot booking: Premium gets first pick of panel times.
          </p>
        ) : (
          <span />
        )}
        <Button
          className="w-full md:w-auto"
          disabled={!selected || book.isPending}
          onClick={() =>
            selected &&
            // mutateAsync, because this row unmounts once the session is booked and a
            // mutate-level callback would then never run.
            book
              .mutateAsync(selected.id)
              .then(() => notify("Session booked"))
              .catch(() => slots.refetch())
          }
        >
          {book.isPending ? "Booking…" : selected ? `Confirm ${confirmLabel(selected)}` : "Confirm"}
        </Button>
      </div>
    </div>
  );
}

function Node({ kind }: { kind: "done" | "next" | "later" | "day0" }) {
  const base = "z-10 size-[18px] shrink-0 rounded-full border-2";
  if (kind === "done")
    return <span aria-hidden className={cn(base, "border-maroon-600 bg-maroon-600")} />;
  if (kind === "day0")
    return <span aria-hidden className={cn(base, "border-navy-900 bg-navy-900")} />;
  if (kind === "next") {
    return (
      <span aria-hidden className={cn(base, "border-gold-500 ring-gold-300/40 bg-white ring-4")} />
    );
  }
  return <span aria-hidden className={cn(base, "border-line bg-white")} />;
}

/** S9 sessions and runway: one vertical timeline, with the slot choice inline (s09.png). */
export function SessionsView() {
  const runway = useRunway();
  const sessions = useSessions();

  if (runway.isPending || sessions.isPending) return <PageSkeleton />;
  if (runway.isError || sessions.isError || !runway.data || !sessions.data) {
    return (
      <ErrorCard
        onRetry={() => {
          runway.refetch();
          sessions.refetch();
        }}
      />
    );
  }

  const r = runway.data;
  const items = sessions.data.items;
  const paid = r.student.plan === "Premium" || r.student.plan === "Elite";
  const firstOpen = items.find(needsSlot);
  const firstBooked = items.find((s) => s.status === "upcoming" || s.status === "rescheduled");
  const topUp = TOP_UP[r.student.plan] ?? TOP_UP.Premium!;
  const lateRunway = r.totalCount < 6;
  const title = lateRunway
    ? "The runway that fits before Day 0."
    : "Eight weeks, mapped before you start.";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-3 md:block">
        <PageHeader
          eyebrow="Runway to the day"
          pill={paid ? "Priority slot booking" : undefined}
          pillClassName="bg-maroon-600 hidden text-white md:inline-block"
          title={
            <>
              <span className="md:hidden">Sessions</span>
              <span className="hidden md:inline">{title}</span>
            </>
          }
          subtitle={
            <span className="hidden md:inline">
              Every plan follows the same track. Day 0 doesn&apos;t move for anyone.
            </span>
          }
        />
        <span className="bg-gold-500/15 shrink-0 rounded-full px-3 py-2 text-xs font-bold tracking-wider text-[#7a5c14] uppercase md:hidden">
          Day 0 in {r.day0.daysLeft} days
        </span>
      </div>
      <RunwayBanner runway={r} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {items.length === 0 ? (
          <EmptyState title="No sessions yet" body="Book your free session to get started." />
        ) : (
          <ol className="relative">
            {items.map((s, i) => {
              const done = s.status === "completed";
              const isNextBooked = s === firstBooked;
              const open = s === firstOpen;
              const prevPanel = items
                .slice(0, i)
                .reverse()
                .find((x) => x.kind === "panel");
              const locked = s.status === "locked";
              const nodeKind = done ? "done" : isNextBooked ? "next" : "later";
              const date = s.startsAt ? formatDay(s.startsAt) : null;
              const time = s.startsAt ? formatTime(s.startsAt) : null;
              const when =
                done && date
                  ? date.split(" ").slice(1).join(" ")
                  : isNextBooked && date
                    ? `${date} · ${time}`
                    : date;
              const detail = [
                date,
                isNextBooked || s.status === "rescheduled" ? time : null,
                s.blurb,
              ].filter(Boolean);
              return (
                <li key={s.id} className="flex gap-3 md:gap-4">
                  <p
                    className={cn(
                      "text-navy-400 hidden w-20 shrink-0 pt-5 text-right text-xs font-semibold tracking-[0.12em] uppercase md:block",
                      nodeKind === "next" && "text-[#7a5c14]",
                    )}
                    aria-hidden
                  >
                    {s.week}
                  </p>
                  <div className="relative flex w-[18px] shrink-0 flex-col items-center pt-5">
                    <Node kind={nodeKind} />
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-[29px] -bottom-[29px] left-1/2 w-0.5 -translate-x-1/2",
                        done ? "bg-maroon-600" : "bg-line",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <div
                      className={cn(
                        "md:rounded-card md:border-line md:border md:bg-white md:p-4",
                        open && "rounded-card border-line border bg-white p-4",
                        isNextBooked && "md:border-gold-500 md:border-2",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-navy-400 text-xs font-semibold tracking-[0.12em] uppercase md:hidden",
                              nodeKind === "next" && "text-[#7a5c14]",
                            )}
                          >
                            {s.week}
                            {when ? ` · ${when}` : ""}
                          </p>
                          <h2 className="text-base leading-snug font-semibold">
                            <Link href={ROUTES.student.session(s.id)} className="hover:underline">
                              {s.title}
                            </Link>
                          </h2>
                          <p className="text-navy-400 mt-0.5 hidden text-sm md:block">
                            {detail.join(" · ") || "Not booked yet"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          {done ? (
                            <>
                              <Badge tone="green" className="hidden md:inline-flex">
                                Done
                              </Badge>
                              <Link
                                href={
                                  s.feedbackId
                                    ? ROUTES.student.feedbackPanel(s.feedbackId)
                                    : ROUTES.student.session(s.id)
                                }
                                className="text-maroon-600 inline-flex min-h-11 items-center text-sm font-semibold underline"
                              >
                                {s.feedbackId ? "View feedback" : "Notes"}
                                <span className="ml-1 md:hidden" aria-hidden>
                                  {s.feedbackId ? " →" : ""}
                                </span>
                              </Link>
                            </>
                          ) : needsSlot(s) ? (
                            s.status === "unbooked" ? (
                              <Badge tone="maroonSoft">Pick a slot</Badge>
                            ) : (
                              <SessionStatusBadge status={s.status} />
                            )
                          ) : locked ? (
                            <Badge tone="neutral" className="hidden md:inline-flex">
                              {s.kind === "panel" && prevPanel && prevPanel.status !== "completed"
                                ? `Opens after ${prevPanel.title.split(":")[0]}`
                                : "Scheduled"}
                            </Badge>
                          ) : (
                            <>
                              <Badge
                                tone={s.status === "rescheduled" ? "maroonSoft" : "goldSoft"}
                                className="md:order-first"
                              >
                                {s.status === "rescheduled" ? "Moved" : "Booked"}
                              </Badge>
                              <Link
                                href={ROUTES.student.session(s.id)}
                                className="border-line rounded-control hidden min-h-11 items-center border bg-white px-4 text-sm font-semibold md:inline-flex"
                              >
                                Reschedule
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                      {s.note && needsSlot(s) && (
                        <p className="text-navy-400 mt-2 text-sm">{s.note}</p>
                      )}
                      {open && <InlineSlots session={s} priority={paid} />}
                    </div>
                  </div>
                </li>
              );
            })}
            <li className="relative flex gap-3 md:gap-4">
              <p className="text-navy-900 hidden w-20 shrink-0 pt-5 text-right text-xs font-semibold tracking-[0.12em] uppercase md:block">
                Day 0
              </p>
              <div className="flex w-[18px] shrink-0 flex-col items-center pt-5">
                <Node kind="day0" />
              </div>
              <div className="md:bg-navy-900 md:rounded-card min-w-0 flex-1 md:p-4 md:text-white">
                <p className="text-navy-900 text-xs font-semibold tracking-[0.12em] uppercase md:hidden">
                  Day 0 · {r.day0.label.split(" ").slice(1).join(" ")}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold">
                    You&apos;re in the room
                    <span className="hidden md:inline"> · {r.day0.label}</span>
                  </h2>
                  <span className="bg-gold-500 text-navy-900 hidden rounded-full px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap uppercase md:inline">
                    {r.day0.daysLeft} days
                  </span>
                </div>
              </div>
            </li>
          </ol>
        )}

        <aside className="hidden space-y-4 lg:block">
          <Card variant="feature" className="space-y-3">
            <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Run out of sessions?
            </p>
            <p>
              Buy more, at your plan&apos;s rate. Anything you spend on top-ups counts toward
              upgrading a tier.
            </p>
            <div className="border-line flex items-center justify-between border-t pt-3 font-medium">
              <span>Extra mock panel</span>
              <span className="font-bold">{formatINR(topUp)}</span>
            </div>
            <Button asChild variant="secondary" className="w-full">
              <Link href={ROUTES.student.billing}>All top-ups</Link>
            </Button>
          </Card>
          <Card variant="inset" className="space-y-2 p-5">
            <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Your panel
            </p>
            <p>
              Always a specialist in your target function. Change your target and we re-assign you
              rather than run the wrong panel.
            </p>
            <Link
              href={ROUTES.student.profileChangeTarget}
              className="text-maroon-600 inline-block text-sm font-semibold underline"
            >
              Change target role →
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
