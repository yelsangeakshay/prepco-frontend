"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { PANELIST_FUNCTIONS } from "@/features/onboarding/schemas";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { notify } from "@/lib/utils/notify";
import { formatSort, parseSort } from "@/lib/utils/tableState";
import { useDebounced } from "@/lib/utils/useDebounced";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useOpsApplications, useOpsPanelists, usePanelistAction } from "../hooks/useOps";
import type { RosterPanelist } from "../schemas";
import { statusTone } from "@/lib/status";

const HEALTH = {
  good: { label: "Good", tone: statusTone("good") },
  watch: { label: "Watch", tone: statusTone("watch") },
  "needs-attention": { label: "Needs attention", tone: statusTone("needs-attention") },
} as const;

/** A6 roster. */
export function PanelistsView() {
  const { params, set } = useUrlState();
  const fn = params.get("function") ?? "";
  const health = params.get("health") ?? "";
  const urlQ = params.get("q") ?? "";
  const sort = params.get("sort");
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 25);

  const [q, setQ] = useState(urlQ);
  const debounced = useDebounced(q, 300);
  useEffect(() => {
    if (debounced !== urlQ) set({ q: debounced }, { resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = useOpsPanelists({ function: fn, health, q: urlQ, sort, page, pageSize });
  const action = usePanelistAction();
  const sorting: SortingState = useMemo(() => parseSort(sort), [sort]);

  const columns = useMemo<ColumnDef<RosterPanelist, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Panelist",
        cell: (c) => <span className="font-semibold">{c.row.original.name}</span>,
      },
      {
        accessorKey: "function",
        header: "Function",
        enableSorting: false,
        cell: (c) => <span className="whitespace-nowrap">{String(c.getValue())}</span>,
      },
      {
        accessorKey: "role",
        header: "Current role",
        enableSorting: false,
        cell: (c) => <span className="whitespace-nowrap">{String(c.getValue())}</span>,
      },
      { accessorKey: "panelsThisSeason", header: "Panels" },
      {
        accessorKey: "turnaroundHours",
        header: "Feedback turnaround",
        enableSorting: false,
        cell: (c) => `${c.getValue()} h`,
      },
      {
        accessorKey: "load",
        header: "This week",
        cell: (c) => `${c.getValue()}/${c.row.original.capacity}`,
      },
      { accessorKey: "rating", header: "Rating", cell: (c) => (c.getValue() as number).toFixed(1) },
      {
        accessorKey: "health",
        header: "Health",
        enableSorting: false,
        cell: (c) => {
          const p = c.row.original;
          const h = HEALTH[p.health];
          return (
            <span className="flex flex-col gap-1">
              <Badge tone={h.tone}>{p.status === "paused" ? "Paused" : h.label}</Badge>
              {p.feedbackOverdue > 0 && (
                <span className="text-maroon-600 text-xs">
                  {p.feedbackOverdue} feedback overdue
                </span>
              )}
              {p.cancellations >= 3 && (
                <span className="text-maroon-600 text-xs">{p.cancellations} cancellations</span>
              )}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: (c) => {
          const p = c.row.original;
          return (
            <span className="flex gap-2">
              {p.feedbackOverdue > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={action.isPending}
                  onClick={() =>
                    action.mutate(
                      { id: p.id, action: "nudge" },
                      { onSuccess: () => notify(`Reminder sent to ${p.name}`) },
                    )
                  }
                >
                  Send Reminder<span className="sr-only"> to {p.name}</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={action.isPending}
                onClick={() =>
                  action.mutate({ id: p.id, action: p.status === "paused" ? "resume" : "pause" })
                }
              >
                {p.status === "paused" ? "Resume" : "Pause"}
                <span className="sr-only"> {p.name}</span>
              </Button>
            </span>
          );
        },
      },
    ],
    [action],
  );

  const counts = query.data?.counts;
  const apps = useOpsApplications("pending");
  const pending = apps.data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <PageHeader
        title={counts ? `${counts.all} panelists` : "Panelists"}
        subtitle={
          counts
            ? `${counts.needsAttention} need attention · ${counts.paused} paused. Each works in the function they interview for.`
            : "Each works in the function they interview for."
        }
      />

      <Button asChild variant="secondary" className="md:hidden">
        <Link href={ROUTES.panelistApply}>View application form</Link>
      </Button>

      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {PANELIST_FUNCTIONS.map((f) => {
          const on = fn === f;
          return (
            <li key={f}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => set({ function: on ? "" : f }, { resetPage: true })}
                className={cn(
                  "rounded-card h-full w-full border bg-white p-4 text-left",
                  on ? "border-maroon-600 border-2" : "border-line",
                )}
              >
                <span className="font-num block text-3xl leading-none font-bold tabular-nums">
                  {counts?.byFunction[f] ?? "—"}
                </span>
                <span className="text-navy-400 mt-2 block text-sm">{f}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col">
          <label htmlFor="panelist-search" className="text-navy-400 mb-1 text-xs font-semibold">
            Search
          </label>
          <Input
            id="panelist-search"
            type="search"
            placeholder="Name, company or specialty"
            className="md:min-h-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          label="Function"
          placeholder="All functions"
          value={fn}
          onChange={(e) => set({ function: e.target.value }, { resetPage: true })}
          options={PANELIST_FUNCTIONS.map((f) => ({ value: f, label: f }))}
        />
        <Select
          label="Health"
          placeholder="Any health"
          value={health}
          onChange={(e) => set({ health: e.target.value }, { resetPage: true })}
          options={[
            { value: "needs-attention", label: "Needs attention" },
            { value: "watch", label: "Watch" },
            { value: "good", label: "Good" },
          ]}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className={cn(action.isError && "outline-maroon-600 outline")}>
          {action.isError && (
            <p role="alert" className="text-maroon-600 mb-2 text-sm">
              Could not update the panelist. Please try again.
            </p>
          )}
          <DataTable
            caption="Panelist roster"
            columns={columns}
            data={query.data?.items ?? []}
            total={query.data?.total ?? 0}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => set({ page: p })}
            sort={sorting}
            onSortChange={(s) => set({ sort: formatSort(s) }, { resetPage: true })}
            loading={query.isPending}
            error={query.isError}
            onRetry={() => query.refetch()}
            emptyTitle="No panelists match"
            getRowId={(r) => r.id}
          />
          <p className="text-navy-400 mt-2 text-xs">
            Feedback turnaround is a proposed metric. Hours from the panel to the written feedback.
          </p>
        </div>

        <Card variant="feature" aria-labelledby="apps-h" role="region">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="apps-h"
              className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase"
            >
              Applications
            </h2>
            {pending.length > 0 && <Badge tone="goldSoft">{pending.length} pending</Badge>}
          </div>
          {pending.length === 0 ? (
            <p className="text-navy-400 mt-4 text-sm">No applications waiting.</p>
          ) : (
            <ul className="divide-line mt-3 divide-y">
              {pending.slice(0, 3).map((a, i) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{a.role}</p>
                    <p className="text-navy-400 text-sm">
                      {a.function} · {a.years} yrs
                    </p>
                  </div>
                  <Button asChild size="sm" variant={i === 0 ? "primary" : "secondary"}>
                    <Link href={ROUTES.ops.panelistApplications}>
                      Review<span className="sr-only"> {a.role}</span>
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {pending.length > 3 && (
            <Link
              href={ROUTES.ops.panelistApplications}
              className="text-maroon-600 mt-3 inline-block text-sm font-semibold underline"
            >
              See all {pending.length}
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}
