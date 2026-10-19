"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { FUNCTIONS } from "@/features/onboarding/schemas";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { notify } from "@/lib/utils/notify";
import { formatSort, parseSort } from "@/lib/utils/tableState";
import { useDebounced } from "@/lib/utils/useDebounced";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useOpsPanelists, usePanelistAction } from "../hooks/useOps";
import type { RosterPanelist } from "../schemas";

const HEALTH = {
  good: { label: "Good", tone: "green" },
  watch: { label: "Watch", tone: "gold" },
  "needs-attention": { label: "Needs attention", tone: "maroon" },
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
        cell: (c) => (
          <span>
            <span className="block font-semibold">{c.row.original.name}</span>
            <span className="text-navy-400 block text-xs">
              {c.row.original.specialty} · {c.row.original.company}
            </span>
          </span>
        ),
      },
      { accessorKey: "function", header: "Function", enableSorting: false },
      { accessorKey: "panelsThisSeason", header: "Panels" },
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

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Panelists</h1>
          {counts && (
            <p className="text-navy-400 text-sm">
              {counts.all} on the roster · {counts.needsAttention} need attention · {counts.paused}{" "}
              paused
            </p>
          )}
        </div>
        <Button asChild variant="secondary">
          <Link href={ROUTES.ops.panelistApplications}>Applications</Link>
        </Button>
      </div>

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
          options={FUNCTIONS.map((f) => ({ value: f, label: f }))}
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
      </div>
    </div>
  );
}
