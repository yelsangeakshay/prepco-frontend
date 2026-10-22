"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useNavigate } from "@/lib/nav/useNavigate";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { FilterPills } from "@/components/shared/FilterPills";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { FUNCTIONS } from "@/features/onboarding/schemas";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatDay } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useDebounced } from "@/lib/utils/useDebounced";
import { formatSort, parseSort } from "@/lib/utils/tableState";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useOpsStudent, useOpsStudents } from "../hooks/useOps";
import type { StudentRow } from "../schemas";
import { statusTone } from "@/lib/status";

const PLAN_TONE = {
  none: statusTone("none"),
  basic: statusTone("basic"),
  premium: statusTone("premium"),
  elite: statusTone("elite"),
} as const;

/** "Arjun Mehta" becomes "A. Mehta". */
function shortName(name: string) {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first![0]}. ${rest.join(" ")}` : name;
}

const columns: ColumnDef<StudentRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Student",
    cell: (c) => (
      <button type="button" className="text-left font-semibold whitespace-nowrap">
        {c.row.original.name}
      </button>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: (c) => {
      const p = c.getValue() as StudentRow["plan"];
      return (
        <Badge tone={PLAN_TONE[p]}>
          {p === "none" ? "Free" : p[0]!.toUpperCase() + p.slice(1)}
        </Badge>
      );
    },
  },
  { accessorKey: "track", header: "Track", enableSorting: false },
  {
    accessorKey: "stage",
    header: "Runway stage",
    enableSorting: false,
    cell: (c) => <span className="whitespace-nowrap">{String(c.getValue())}</span>,
  },
  {
    accessorKey: "panelistName",
    header: "Panel",
    enableSorting: false,
    cell: (c) => {
      const r = c.row.original;
      return r.panelistName ? (
        <span className="whitespace-nowrap">
          {r.function} · {shortName(r.panelistName)}
        </span>
      ) : (
        <span className="text-navy-400">Unassigned</span>
      );
    },
  },
  { accessorKey: "readiness", header: "Readiness", cell: (c) => `${c.getValue()}%` },
];

const PAGE_SIZES = [
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
  { value: "1000", label: "All 1,000 (virtualised)" },
];

/** Filter pills (a02.png). Each one sets one URL filter and clears the others. */
const PILL_FILTERS: Record<string, Record<string, string>> = {
  all: {},
  finals: { track: "Finals" },
  summers: { track: "Summers" },
  basic: { plan: "basic" },
  premium: { plan: "premium" },
  elite: { plan: "elite" },
  attention: { status: "at-risk" },
};

type Detail = NonNullable<ReturnType<typeof useOpsStudent>["data"]>;

function StudentPanelBody({ d }: { d: Detail }) {
  const done = d.sessions.filter((x) => x.status === "completed");
  const next = d.sessions
    .filter((x) => x.status === "upcoming" || x.status === "unassigned")
    .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""))[0];
  const lastDone = [...done].sort((a, b) => (b.startsAt ?? "").localeCompare(a.startsAt ?? ""))[0];
  const panelist = [...d.sessions].reverse().find((x) => x.panelistName)?.panelistName;
  const plan = d.plan === "none" ? "Free" : d.plan[0]!.toUpperCase() + d.plan.slice(1);
  const nextLabel = next
    ? `${next.title.replace("Domain d", "D")} · ${next.startsAt ? formatDay(next.startsAt) : "No time"}`
    : "Nothing booked";
  const rows: [string, string][] = [
    ["Plan", plan],
    ["CV", d.cv.version ? `${d.cv.version} · Locked · ${d.cv.score}` : "Not locked"],
    ["Answers", `${d.answers.prepared} / ${d.answers.total} · ${d.answers.needWork} need work`],
    ["Last panel", lastDone ? `${lastDone.title.split(":")[0]} · ${d.readiness}%` : "None yet"],
    ["Next", nextLabel],
    ["Panelist", panelist ?? "Unassigned"],
  ];
  return (
    <>
      <div>
        <h2 className="font-display text-3xl leading-tight font-bold">{d.name}</h2>
        <p className="text-navy-400 mt-1 text-sm">
          {d.college} · {d.background}
        </p>
      </div>
      <div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Runway</span>
          <span>{done.length} of 6</span>
        </div>
        <ProgressBar className="mt-2" value={done.length} max={6} label="Runway sessions done" />
      </div>
      <dl className="divide-line divide-y text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3">
            <dt className="text-navy-400">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link href={ROUTES.ops.assignments}>Change panelist</Link>
        </Button>
        <Button onClick={() => notify(`Messaging ${d.name} is not connected in the mock`)}>
          Message
        </Button>
        <Button asChild variant="ghost">
          <Link href={ROUTES.ops.student(d.id)}>Full profile</Link>
        </Button>
      </div>
    </>
  );
}

/** The card beside the table: one student at a glance. */
function StudentPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isPending, isError } = useOpsStudent(id);
  return (
    <Card variant="feature" className="space-y-4" data-testid="student-panel">
      <div className="flex items-center justify-between">
        <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
          Student
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close student panel"
          className="text-navy-400 -m-2 inline-flex size-11 items-center justify-center text-xl"
        >
          <span aria-hidden>×</span>
        </button>
      </div>
      {isPending ? (
        <p role="status" className="text-navy-400 text-sm">
          Loading…
        </p>
      ) : isError || !data ? (
        <p role="alert" className="text-maroon-600 text-sm">
          Could not load this student.
        </p>
      ) : (
        <StudentPanelBody d={data} />
      )}
    </Card>
  );
}

/** A2 students (a02.png). Search, filters, sort, page and the open student live in the URL. */
export function StudentsView() {
  const { navigate } = useNavigate();
  const { params, set } = useUrlState();
  const urlQ = params.get("q") ?? "";
  const plan = params.get("plan") ?? "";
  const fn = params.get("function") ?? "";
  const status = params.get("status") ?? "";
  const track = params.get("track") ?? "";
  const selected = params.get("student") ?? "";
  const sort = params.get("sort");
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 25);

  const [q, setQ] = useState(urlQ);
  const debounced = useDebounced(q, 300);
  useEffect(() => {
    if (debounced !== urlQ) set({ q: debounced }, { resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = useOpsStudents({
    q: urlQ,
    plan,
    function: fn,
    status,
    track,
    sort,
    page,
    pageSize,
  });
  const sorting: SortingState = useMemo(() => parseSort(sort), [sort]);

  const activePill = track
    ? track.toLowerCase()
    : plan && plan !== "none"
      ? plan
      : status === "at-risk"
        ? "attention"
        : "all";
  const pills = [
    { key: "all", label: "All" },
    { key: "finals", label: "Finals" },
    { key: "summers", label: "Summers" },
    { key: "basic", label: "Basic" },
    { key: "premium", label: "Premium" },
    { key: "elite", label: "Elite" },
    {
      key: "attention",
      label: "Needs attention",
      count: query.data ? `· ${query.data.counts.attention}` : undefined,
    },
  ];
  const pickPill = (key: string) =>
    set({ plan: "", status: "", track: "", ...PILL_FILTERS[key] }, { resetPage: true });

  // On a wide screen a row opens the side card; on a phone it opens the full page.
  const openRow = (r: StudentRow) => {
    if (window.matchMedia("(min-width: 1024px)").matches) set({ student: r.id });
    else navigate(ROUTES.ops.student(r.id));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <PageHeader
        title="Students"
        subtitle={
          query.data
            ? `${query.data.total.toLocaleString("en-IN")} students · Season 1`
            : "Season 1"
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <FilterPills
          label="Filter students"
          pills={pills}
          active={activePill}
          onSelect={pickPill}
        />
        <div className="flex flex-col md:w-72">
          <label htmlFor="student-search" className="text-navy-400 mb-1 text-xs font-semibold">
            Search
          </label>
          <Input
            id="student-search"
            type="search"
            placeholder="Search by name or college"
            className="md:min-h-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <Select
          label="Function"
          placeholder="All functions"
          value={fn}
          onChange={(e) => set({ function: e.target.value }, { resetPage: true })}
          options={FUNCTIONS.map((f) => ({ value: f, label: f }))}
        />
        <Select
          label="Rows"
          value={String(pageSize)}
          onChange={(e) => set({ pageSize: e.target.value }, { resetPage: true })}
          options={PAGE_SIZES}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <DataTable
          caption="Students"
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
          emptyTitle="No students match"
          emptyBody="Try clearing a filter."
          getRowId={(r) => r.id}
          onRowClick={openRow}
          rowClassName={(r) => cn(r.id === selected && "bg-gold-500/10")}
        />
        {selected ? (
          <div className="hidden lg:block">
            <StudentPanel id={selected} onClose={() => set({ student: "" })} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
