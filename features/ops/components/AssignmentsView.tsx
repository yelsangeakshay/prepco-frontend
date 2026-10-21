"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { formatSession } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useAssign, useOpsAssignments } from "../hooks/useOps";
import type { Assignments } from "../schemas";

type Row = Assignments["unassigned"][number];

function AssignRow({ row }: { row: Row }) {
  const assign = useAssign();
  const [panelistId, setPanelistId] = useState("");
  const err = assign.error instanceof ApiError ? assign.error : null;
  const b = row.booking;
  const selectId = `assign-${b.id}`;

  return (
    <Card className="space-y-3" data-testid={`unassigned-${b.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 md:pr-72">
        <div>
          <p className="font-semibold">{b.studentName}</p>
          <p className="text-navy-400 text-sm">
            {b.title} · {b.function}
          </p>
          <p className="text-sm">{b.startsAt ? formatSession(b.startsAt) : "No time"}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={selectId} className="text-navy-400 mb-1 block text-xs font-semibold">
            Panelist for {b.studentName}
          </label>
          <select
            id={selectId}
            value={panelistId}
            onChange={(e) => setPanelistId(e.target.value)}
            className="rounded-control border-line min-h-11 w-full border bg-white px-3 text-sm"
          >
            <option value="">Choose a panelist</option>
            {row.candidates.map((c) => (
              <option key={c.panelistId} value={c.panelistId}>
                {c.name} · {c.specialty} · {c.load}/{c.capacity} this week ·{" "}
                {c.free ? "free" : "not free"}
              </option>
            ))}
          </select>
        </div>
        <Button
          disabled={!panelistId || assign.isPending}
          onClick={() =>
            assign.mutate(
              { sessionId: b.id, panelistId },
              { onSuccess: () => notify(`Assigned for ${b.studentName}`) },
            )
          }
        >
          {assign.isPending ? "Assigning…" : "Assign"}
        </Button>
      </div>
      {assign.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          {err?.message ?? "Could not assign. Please try again."}
        </p>
      )}
    </Card>
  );
}

/** A3 panel assignment: load per function, then the unassigned queue. */
export function AssignmentsView() {
  const { data, isPending, isError, refetch } = useOpsAssignments();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Panel assignment</h1>
        <p className="text-navy-400 text-sm" data-testid="unassigned-count">
          {data.unassigned.length} panels without a panelist
        </p>
      </div>

      <section aria-labelledby="load-h">
        <h2 id="load-h" className="font-display mb-3 text-xl font-bold">
          Load per function (this week)
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {data.load.map((l) => (
            <li key={l.function}>
              <Card>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold">{l.function}</p>
                  <p className="text-navy-400 text-xs">
                    {l.panelists} panelists
                    {l.unassigned > 0 && (
                      <span className="text-maroon-600"> · {l.unassigned} unassigned</span>
                    )}
                  </p>
                </div>
                <p className="text-navy-400 mt-1 text-xs tabular-nums">
                  {l.booked} of {l.capacity} slots booked
                </p>
                <ProgressBar
                  className="mt-2"
                  value={l.booked}
                  max={l.capacity || 1}
                  label={`${l.function} load`}
                />
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="queue-h" className="space-y-3">
        <h2 id="queue-h" className="font-display text-xl font-bold">
          Waiting for a panelist
        </h2>
        {data.unassigned.length === 0 ? (
          <EmptyState title="Everything is assigned" body="New bookings will appear here." />
        ) : (
          data.unassigned.map((r) => <AssignRow key={r.booking.id} row={r} />)
        )}
      </section>
    </div>
  );
}
