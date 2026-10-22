"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatDay } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useDecideApplication, useOpsApplications } from "../hooks/useOps";
import type { ApplicationRow } from "../schemas";

function ApplicationCard({ a }: { a: ApplicationRow }) {
  const decide = useDecideApplication();
  const err = decide.error instanceof ApiError ? decide.error : null;
  return (
    <Card data-testid={`application-${a.id}`} className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2 md:pr-72">
        <div>
          <p className="font-semibold">{a.name}</p>
          <p className="text-navy-400 text-sm">
            {a.role}, {a.company} · {a.years} years · {a.function}
          </p>
          <p className="text-navy-400 text-xs">
            {a.email} · applied {formatDay(a.submittedAt)}
          </p>
        </div>
        {a.status !== "pending" && (
          <Badge tone={a.status === "approved" ? "green" : "maroonSoft"}>{a.status}</Badge>
        )}
      </div>
      <p className="text-sm">{a.why}</p>
      {a.status === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={decide.isPending}
            loading={
              decide.isPending &&
              decide.variables?.id === a.id &&
              decide.variables.decision === "approve"
            }
            onClick={() =>
              decide.mutate(
                { id: a.id, decision: "approve" },
                { onSuccess: () => notify(`${a.name} added to the roster`) },
              )
            }
          >
            Approve<span className="sr-only"> {a.name}</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={decide.isPending}
            loading={
              decide.isPending &&
              decide.variables?.id === a.id &&
              decide.variables.decision === "reject"
            }
            onClick={() => decide.mutate({ id: a.id, decision: "reject" })}
          >
            Reject<span className="sr-only"> {a.name}</span>
          </Button>
        </div>
      )}
      {decide.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          {err?.message ?? "Could not record the decision."}
        </p>
      )}
    </Card>
  );
}

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
] as const;

/** A6 application queue. */
export function ApplicationsView() {
  const { params, set } = useUrlState();
  const status = params.get("status") ?? "pending";
  const { data, isPending, isError, refetch } = useOpsApplications(status);

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
      <Link href={ROUTES.ops.panelists} className="text-maroon-600 text-sm font-semibold underline">
        Roster
      </Link>
      <PageHeader title="Panelist applications" />

      <div role="tablist" aria-label="Application status" className="flex gap-2">
        {TABS.map((t) => {
          const active = status === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => set({ status: t.key === "pending" ? "" : t.key })}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-semibold",
                active ? "border-maroon-600 bg-maroon-600 text-white" : "border-line bg-white",
              )}
            >
              {t.label}
              {data && <span className="ml-1.5 opacity-80">{data.counts[t.key]}</span>}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <PageSkeleton />
      ) : isError || !data ? (
        <ErrorCard onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState title={`No ${status} applications`} />
      ) : (
        <ul className="space-y-3">
          {data.items.map((a) => (
            <li key={a.id}>
              <ApplicationCard a={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
