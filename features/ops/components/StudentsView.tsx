"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { FUNCTIONS } from "@/features/onboarding/schemas";
import { ROUTES } from "@/lib/config/routes";
import { useDebounced } from "@/lib/utils/useDebounced";
import { formatSort, parseSort } from "@/lib/utils/tableState";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useOpsStudents } from "../hooks/useOps";
import type { StudentRow } from "../schemas";

const PLAN_TONE = { none: "neutral", basic: "neutral", premium: "maroon", elite: "gold" } as const;
const STATUS_TONE = { active: "green", "at-risk": "maroonSoft", unpaid: "neutral" } as const;

const columns: ColumnDef<StudentRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Student",
    cell: (c) => (
      <span>
        <span className="block font-semibold">{c.row.original.name}</span>
        <span className="text-navy-400 block text-xs">{c.row.original.email}</span>
      </span>
    ),
  },
  { accessorKey: "college", header: "College", enableSorting: false },
  { accessorKey: "function", header: "Function", enableSorting: false },
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
  { accessorKey: "readiness", header: "Readiness", cell: (c) => `${c.getValue()}%` },
  { accessorKey: "panelsDone", header: "Panels" },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: (c) => {
      const s = c.getValue() as StudentRow["status"];
      return (
        <Badge tone={STATUS_TONE[s]}>
          {s === "at-risk" ? "At risk" : s[0]!.toUpperCase() + s.slice(1)}
        </Badge>
      );
    },
  },
];

const PAGE_SIZES = [
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
  { value: "1000", label: "All 1,000 (virtualised)" },
];

/** A2 students. Search, filters, sort and page live in the URL. */
export function StudentsView() {
  const router = useRouter();
  const { params, set } = useUrlState();
  const urlQ = params.get("q") ?? "";
  const plan = params.get("plan") ?? "";
  const fn = params.get("function") ?? "";
  const status = params.get("status") ?? "";
  const sort = params.get("sort");
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 25);

  const [q, setQ] = useState(urlQ);
  const debounced = useDebounced(q, 300);
  useEffect(() => {
    if (debounced !== urlQ) set({ q: debounced }, { resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = useOpsStudents({ q: urlQ, plan, function: fn, status, sort, page, pageSize });
  const sorting: SortingState = useMemo(() => parseSort(sort), [sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Students</h1>
        {query.data && (
          <p className="text-navy-400 text-sm">{query.data.total.toLocaleString("en-IN")} match</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col">
          <label htmlFor="student-search" className="text-navy-400 mb-1 text-xs font-semibold">
            Search
          </label>
          <Input
            id="student-search"
            type="search"
            placeholder="Name, email or college"
            className="md:min-h-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          label="Plan"
          placeholder="All plans"
          value={plan}
          onChange={(e) => set({ plan: e.target.value }, { resetPage: true })}
          options={[
            { value: "none", label: "Free" },
            { value: "basic", label: "Basic" },
            { value: "premium", label: "Premium" },
            { value: "elite", label: "Elite" },
          ]}
        />
        <Select
          label="Function"
          placeholder="All functions"
          value={fn}
          onChange={(e) => set({ function: e.target.value }, { resetPage: true })}
          options={FUNCTIONS.map((f) => ({ value: f, label: f }))}
        />
        <Select
          label="Status"
          placeholder="Any status"
          value={status}
          onChange={(e) => set({ status: e.target.value }, { resetPage: true })}
          options={[
            { value: "active", label: "Active" },
            { value: "at-risk", label: "At risk" },
            { value: "unpaid", label: "Unpaid" },
          ]}
        />
        <Select
          label="Rows"
          value={String(pageSize)}
          onChange={(e) => set({ pageSize: e.target.value }, { resetPage: true })}
          options={PAGE_SIZES}
        />
      </div>

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
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="No students match"
        emptyBody="Try clearing a filter."
        getRowId={(r) => r.id}
        onRowClick={(r) => router.push(ROUTES.ops.student(r.id))}
      />
    </div>
  );
}
