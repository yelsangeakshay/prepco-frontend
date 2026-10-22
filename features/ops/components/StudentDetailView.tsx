"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { LedgerRow } from "@/features/ops/ledger/components/LedgerRow";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatDay, formatSession } from "@/lib/utils/dates";
import { useOpsStudent, useRelockDecision } from "../hooks/useOps";
import { statusTone } from "@/lib/status";

const STATUS_TONE = {
  upcoming: statusTone("upcoming"),
  completed: statusTone("completed"),
  "no-show": statusTone("no-show"),
  cancelled: statusTone("cancelled"),
  unassigned: statusTone("unassigned"),
} as const;

/** A2 detail. */
export function StudentDetailView({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useOpsStudent(id);
  const relock = useRelockDecision(id);
  if (isPending) return <PageSkeleton />;
  if (isError || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ErrorCard
        title={notFound ? "Student not found" : undefined}
        message={notFound ? "That student does not exist." : undefined}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <Link href={ROUTES.ops.students} className="text-maroon-600 text-sm font-semibold underline">
        All students
      </Link>
      <PageHeader
        eyebrow={`${data.track} track · ${data.college}`}
        title={data.name}
        subtitle={data.email}
      />

      {data.relockRequest && (
        <Card variant="inset" data-testid="relock-request" className="space-y-3">
          <p className="font-semibold">
            CV re-lock requested {formatDay(data.relockRequest.requestedAt)}
          </p>
          <p className="text-sm">&ldquo;{data.relockRequest.reason}&rdquo;</p>
          <p className="text-navy-400 text-sm">Draft score {data.relockRequest.draftScore}</p>
          <div className="flex gap-2">
            <Button size="sm" disabled={relock.isPending} onClick={() => relock.mutate("approve")}>
              Approve Re-lock
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={relock.isPending}
              onClick={() => relock.mutate("reject")}
            >
              Decline
            </Button>
          </div>
          {relock.isError && (
            <p role="alert" className="text-maroon-600 text-sm">
              Could not record the decision. Please try again.
            </p>
          )}
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-navy-400 text-xs font-semibold uppercase">Plan</p>
          <p className="font-display text-2xl font-bold capitalize">
            {data.plan === "none" ? "Free" : data.plan}
          </p>
        </Card>
        <Card>
          <p className="text-navy-400 text-xs font-semibold uppercase">Readiness</p>
          <p className="font-num text-2xl font-bold">{data.readiness}%</p>
        </Card>
        <Card>
          <p className="text-navy-400 text-xs font-semibold uppercase">CV</p>
          <p className="font-num text-2xl font-bold">
            {data.cv.score}
            <span className="text-navy-400 text-sm font-normal"> {data.cv.version ?? "none"}</span>
          </p>
        </Card>
        <Card>
          <p className="text-navy-400 text-xs font-semibold uppercase">Answers</p>
          <p className="font-num text-2xl font-bold">
            {data.answers.prepared}/{data.answers.total}
            <span className="text-maroon-600 text-sm font-normal">
              {" "}
              {data.answers.needWork} need work
            </span>
          </p>
        </Card>
      </div>

      <Card variant="feature">
        <h2 className="font-display mb-3 text-xl font-bold">Sessions</h2>
        {data.sessions.length === 0 ? (
          <p className="text-navy-400 text-sm">No panels booked yet.</p>
        ) : (
          <ul className="divide-line divide-y">
            {data.sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="text-navy-400">
                    {s.startsAt ? formatSession(s.startsAt) : "No time"} ·{" "}
                    {s.panelistName ?? "No panelist"}
                  </span>
                </span>
                <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card variant="feature">
        <h2 className="font-display mb-2 text-xl font-bold">Payments</h2>
        {data.payments.length === 0 ? (
          <p className="text-navy-400 text-sm">No payments.</p>
        ) : (
          data.payments.map((p) => (
            <LedgerRow
              key={p.id}
              date={formatDay(p.at)}
              description={p.description}
              amount={p.amount}
            />
          ))
        )}
      </Card>
    </div>
  );
}
