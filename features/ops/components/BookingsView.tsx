"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FilterPills } from "@/components/shared/FilterPills";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatSession } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { formatSort, parseSort } from "@/lib/utils/tableState";
import { useDebounced } from "@/lib/utils/useDebounced";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useCohort, useExcuse, useOpsBookings } from "../hooks/useOps";
import type { Booking } from "../schemas";
import { statusTone } from "@/lib/status";

const KINDS = [
  { key: "", label: "All" },
  { key: "free", label: "Free session" },
  { key: "profiling", label: "Profiling" },
  { key: "p1", label: "P1" },
  { key: "deep-dive", label: "Deep-dive" },
  { key: "p2", label: "P2" },
  { key: "p3", label: "P3" },
  { key: "case", label: "Case track" },
];

/** Status pill text and colour for one booking (a04.png). */
function statusOf(b: Booking): { label: string; tone: BadgeProps["tone"] } {
  if (b.status === "unassigned") {
    return { label: "Needs panelist", tone: statusTone("needs panelist") };
  }
  if (b.status === "no-show") {
    return b.excused
      ? { label: "No-show (excused)", tone: statusTone("cancelled") }
      : { label: "No-show", tone: statusTone("no-show") };
  }
  if (b.status === "completed")
    return { label: "Feedback sent", tone: statusTone("feedback sent") };
  if (b.status === "cancelled") return { label: "Cancelled", tone: statusTone("cancelled") };
  return /free session/i.test(b.title)
    ? { label: "Booked", tone: statusTone("booked") }
    : { label: "Confirmed", tone: statusTone("confirmed") };
}

interface StatProps {
  label: string;
  value: number | string;
  tone?: "maroon";
  /** Set on the cards that also work as a filter. */
  pressed?: boolean;
  onClick?: () => void;
}

function Stat({ label, value, tone, pressed, onClick }: StatProps) {
  const body = (
    <>
      <span className="text-navy-400 block text-sm">{label}</span>
      <span
        className={cn(
          "font-num mt-1 block text-4xl font-bold tabular-nums",
          tone === "maroon" && "text-maroon-600",
        )}
      >
        {value}
      </span>
    </>
  );
  const base = "rounded-card w-full border bg-white p-5 text-left";
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(base, pressed ? "border-maroon-600 border-2" : "border-line")}
    >
      {body}
    </button>
  ) : (
    <div className={cn(base, "border-line")}>{body}</div>
  );
}

/** A4 sessions and bookings (a04.png). */
export function BookingsView() {
  const { params, set } = useUrlState();
  const tab = params.get("tab") ?? "all";
  const kind = params.get("kind") ?? "";
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

  const query = useOpsBookings({ tab, kind, q: urlQ, sort, page, pageSize });
  const cohort = useCohort();
  const excuse = useExcuse();
  const sorting: SortingState = useMemo(() => parseSort(sort), [sort]);

  const columns = useMemo<ColumnDef<Booking, unknown>[]>(
    () => [
      {
        accessorKey: "startsAt",
        header: "When",
        cell: (c) => (
          <span className="whitespace-nowrap">
            {c.getValue() ? formatSession(c.getValue() as string) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "studentName",
        header: "Student",
        cell: (c) => <span className="font-semibold">{String(c.getValue())}</span>,
      },
      { accessorKey: "title", header: "Session", enableSorting: false },
      {
        accessorKey: "panelistName",
        header: "Panelist",
        enableSorting: false,
        cell: (c) => {
          const b = c.row.original;
          if (b.panelistName) return b.panelistName;
          if (/free session/i.test(b.title)) return "Prep Co team";
          return <span className="text-navy-400">Unassigned</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (c) => {
          const st = statusOf(c.row.original);
          return <Badge tone={st.tone}>{st.label}</Badge>;
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
              <Button asChild size="sm">
                <Link href={ROUTES.ops.assignments}>
                  Assign<span className="sr-only"> {b.studentName}</span>
                </Link>
              </Button>
            );
          }
          if (b.status === "no-show" && !b.excused) {
            return (
              <Button
                size="sm"
                variant="secondary"
                disabled={excuse.isPending}
                loading={excuse.isPending && excuse.variables === b.id}
                onClick={(e) => {
                  e.stopPropagation();
                  excuse.mutate(b.id, { onSuccess: () => notify(`Excused ${b.studentName}`) });
                }}
              >
                Excuse<span className="sr-only"> {b.studentName}</span>
              </Button>
            );
          }
          return (
            <Button asChild size="sm" variant="secondary">
              <Link href={ROUTES.ops.student(b.studentId)}>
                Open<span className="sr-only"> {b.studentName}</span>
              </Link>
            </Button>
          );
        },
      },
    ],
    [excuse],
  );

  const counts = query.data?.counts;
  const week = cohort.data?.thisWeek;

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <PageHeader title="Sessions & bookings" subtitle="Synced from Calendly." />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="This week" value={week?.sessionsScheduled ?? "—"} />
        <Stat label="Free sessions" value={week?.freeSessions ?? "—"} />
        <Stat
          label="No panelist yet"
          value={counts?.unassigned ?? "—"}
          tone="maroon"
          pressed={tab === "unassigned"}
          onClick={() =>
            set({ tab: tab === "unassigned" ? "" : "unassigned" }, { resetPage: true })
          }
        />
        <Stat
          label="No-shows"
          value={counts?.noShows ?? "—"}
          pressed={tab === "no-shows"}
          onClick={() => set({ tab: tab === "no-shows" ? "" : "no-shows" }, { resetPage: true })}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <FilterPills
          label="Session kind"
          pills={KINDS}
          active={kind}
          onSelect={(k) => set({ kind: k }, { resetPage: true })}
        />
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
