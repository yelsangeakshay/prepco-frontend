"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatSession } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { formatSort, parseSort } from "@/lib/utils/tableState";
import { useDebounced } from "@/lib/utils/useDebounced";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useExcuse, useOpsBookings } from "../hooks/useOps";
import type { Booking } from "../schemas";

const TONE = {
  upcoming: "navy",
  completed: "green",
  "no-show": "maroonSoft",
  cancelled: "neutral",
  unassigned: "maroon",
} as const;

const TABS = [
  { key: "all", label: "All", count: "all" },
  { key: "unassigned", label: "Unassigned", count: "unassigned" },
  { key: "no-shows", label: "No-shows", count: "noShows" },
] as const;

/** A4 sessions and bookings. */
export function BookingsView() {
  const { params, set } = useUrlState();
  const tab = params.get("tab") ?? "all";
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

  const query = useOpsBookings({ tab, q: urlQ, sort, page, pageSize });
  const excuse = useExcuse();
  const sorting: SortingState = useMemo(() => parseSort(sort), [sort]);

  const columns = useMemo<ColumnDef<Booking, unknown>[]>(
    () => [
      { accessorKey: "studentName", header: "Student" },
      { accessorKey: "title", header: "Session", enableSorting: false },
      {
        accessorKey: "startsAt",
        header: "When",
        cell: (c) => (c.getValue() ? formatSession(c.getValue() as string) : "—"),
      },
      {
        accessorKey: "panelistName",
        header: "Panelist",
        enableSorting: false,
        cell: (c) =>
          (c.getValue() as string | null) ?? <span className="text-maroon-600">None</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (c) => {
          const b = c.row.original;
          return (
            <Badge tone={TONE[b.status]}>
              {b.status === "no-show" && b.excused ? "no-show (excused)" : b.status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: (c) => {
          const b = c.row.original;
          if (b.status === "unassigned") {
            return (
              <Button asChild size="sm" variant="secondary">
                <Link href={ROUTES.ops.assignments}>Assign</Link>
              </Button>
            );
          }
          if (b.status === "no-show" && !b.excused) {
            return (
              <Button
                size="sm"
                variant="secondary"
                disabled={excuse.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  excuse.mutate(b.id, { onSuccess: () => notify(`Excused ${b.studentName}`) });
                }}
              >
                Excuse<span className="sr-only"> {b.studentName}</span>
              </Button>
            );
          }
          return null;
        },
      },
    ],
    [excuse],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Sessions & bookings</h1>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div role="tablist" aria-label="Filter bookings" className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => set({ tab: t.key === "all" ? "" : t.key }, { resetPage: true })}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-semibold",
                  active ? "border-maroon-600 bg-maroon-600 text-white" : "border-line bg-white",
                )}
              >
                {t.label}
                {query.data && (
                  <span className="ml-1.5 opacity-80">{query.data.counts[t.count]}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="md:w-64">
          <label
            htmlFor="booking-search"
            className="text-navy-400 mb-1 block text-xs font-semibold"
          >
            Search
          </label>
          <Input
            id="booking-search"
            type="search"
            placeholder="Student or session"
            className="md:min-h-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        caption="Bookings"
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
        emptyTitle={
          tab === "no-shows"
            ? "No no-shows"
            : tab === "unassigned"
              ? "Nothing unassigned"
              : "No bookings"
        }
        getRowId={(r) => r.id}
      />
    </div>
  );
}
