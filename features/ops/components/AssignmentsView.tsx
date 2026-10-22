"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { Avatar } from "@/components/shell/Avatar";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { formatDay, formatSession } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useAssign, useOpsAssignments } from "../hooks/useOps";
import type { Assignments } from "../schemas";

type Row = Assignments["unassigned"][number];
type Candidate = Row["candidates"][number];

/** "P2: external specialist panel" becomes "P2"; "Domain deep-dive" becomes "Deep-dive". */
function kindOf(title: string) {
  const head = title.split(":")[0]!.replace("Domain ", "");
  return head[0]!.toUpperCase() + head.slice(1);
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CandidateRow({
  c,
  best,
  booking,
}: {
  c: Candidate;
  best: boolean;
  booking: Row["booking"];
}) {
  const assign = useAssign();
  const err = assign.error instanceof ApiError ? assign.error : null;
  const b = booking;
  const full = c.load >= c.capacity;
  return (
    <li className="py-4" data-testid={`candidate-${c.panelistId}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Avatar initials={initialsOf(c.name)} tone="navy" label={c.name} className="size-12" />
        <div className="min-w-0 flex-1 basis-48">
          <p className="font-semibold">{c.name}</p>
          <p className="text-navy-400 text-sm">
            {c.specialty} · {c.free ? "open at that time" : "no open slot then"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {best && <Badge tone="green">Best match</Badge>}
          {full && <Badge tone="maroonSoft">Full</Badge>}
          <span className="text-navy-400 text-sm whitespace-nowrap">{c.load} this week</span>
          <Button
            variant={best ? "primary" : "secondary"}
            disabled={assign.isPending}
            onClick={() =>
              assign.mutate(
                { sessionId: b.id, panelistId: c.panelistId },
                { onSuccess: () => notify(`Assigned for ${b.studentName}`) },
              )
            }
          >
            {assign.isPending ? "Assigning…" : "Assign"}
            <span className="sr-only">
              {" "}
              {c.name} to {b.studentName}
            </span>
          </Button>
        </div>
      </div>
      {assign.isError && (
        <p role="alert" className="text-maroon-600 mt-2 text-sm">
          {err?.message ?? "Could not assign. Please try again."}
        </p>
      )}
    </li>
  );
}

function QueueItem({
  row,
  selected,
  onSelect,
}: {
  row: Row;
  selected: boolean;
  onSelect: () => void;
}) {
  const b = row.booking;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        data-testid={`unassigned-${b.id}`}
        className={cn(
          "rounded-card w-full border bg-white p-4 text-left",
          selected ? "border-maroon-600 border-2" : "border-line",
        )}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="font-semibold">{b.studentName}</span>
          <Badge tone={selected ? "maroonSoft" : "neutral"}>{kindOf(b.title)}</Badge>
        </span>
        <span className="text-navy-400 mt-1 block text-sm">
          {b.startsAt ? formatSession(b.startsAt) : "No time"} · {b.function}
        </span>
      </button>
    </li>
  );
}

/** A3 panel assignment (a03.png): the waiting list, the candidates for one, then load per function. */
export function AssignmentsView() {
  const { data, isPending, isError, refetch } = useOpsAssignments();
  const [picked, setPicked] = useState("");
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const row = data.unassigned.find((r) => r.booking.id === picked) ?? data.unassigned[0];
  const first = row?.booking.studentName.split(" ")[0];
  const bestId = row?.candidates.find((c) => c.free && c.load < c.capacity)?.panelistId;
  const maxLoad = Math.max(1, ...data.load.map((l) => l.booked));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <PageHeader title="Panel assignment" subtitle="Always a specialist in the target function." />

      <p className="sr-only" data-testid="unassigned-count">
        {data.unassigned.length} panels without a panelist
      </p>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section aria-labelledby="queue-h" className="space-y-3">
          <h2
            id="queue-h"
            className="text-sm font-semibold tracking-[0.16em] uppercase"
            data-testid="waiting-heading"
          >
            Waiting · {data.unassigned.length}
          </h2>
          {data.unassigned.length === 0 ? (
            <EmptyState title="Everything is assigned" body="New bookings will appear here." />
          ) : (
            <ul className="space-y-3">
              {data.unassigned.map((r) => (
                <QueueItem
                  key={r.booking.id}
                  row={r}
                  selected={r.booking.id === row?.booking.id}
                  onSelect={() => setPicked(r.booking.id)}
                />
              ))}
            </ul>
          )}
        </section>

        {row && (
          <Card variant="feature" aria-labelledby="cand-h" role="region">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 id="cand-h" className="font-display text-2xl font-bold">
                {row.candidates[0]?.function ?? row.booking.function} panelists for {first}
              </h2>
              <span className="bg-cream-soft rounded-full px-3 py-1 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                {kindOf(row.booking.title)} ·{" "}
                {row.booking.startsAt ? formatDay(row.booking.startsAt) : "No time"}
              </span>
            </div>
            <p className="text-navy-400 mt-1 text-sm">
              Their CV, profiling notes and previous feedback move with them. The new panelist reads
              them before the panel.
            </p>
            {row.candidates.length === 0 ? (
              <p className="text-navy-400 mt-4 text-sm">No active panelist in this function.</p>
            ) : (
              <ul className="divide-line mt-2 divide-y">
                {row.candidates.map((c) => (
                  <CandidateRow
                    key={c.panelistId}
                    c={c}
                    booking={row.booking}
                    best={c.panelistId === bestId}
                  />
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>

      <Card variant="feature" aria-labelledby="load-h" role="region">
        <h2 id="load-h" className="font-display text-2xl font-bold">
          Load by function · this week
        </h2>
        <ul className="mt-5 space-y-3">
          {data.load.map((l) => (
            <li
              key={l.function}
              className="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-3 gap-y-1 md:grid-cols-[14rem_minmax(0,1fr)_2rem]"
            >
              <span className="text-sm md:text-[15px]">{l.function}</span>
              <span className="text-right text-sm font-bold tabular-nums md:order-3">
                {l.booked}
              </span>
              <ProgressBar
                className="col-span-2 h-2 md:order-2 md:col-span-1"
                value={l.booked}
                max={maxLoad}
                label={`${l.function} load`}
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
