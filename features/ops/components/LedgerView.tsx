"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { SampleDataBadge } from "@/components/shared/Badges";
import { StatCard } from "@/components/shared/StatCard";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/currency";
import { formatDay } from "@/lib/utils/dates";
import { useDebounced } from "@/lib/utils/useDebounced";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useOpsLedger } from "../hooks/useOps";
import type { LedgerEntry } from "../schemas";

const TONE = { payment: "green", "top-up": "green", refund: "maroonSoft", credit: "gold" } as const;

const columns: ColumnDef<LedgerEntry, unknown>[] = [
  {
    accessorKey: "at",
    header: "Date",
    enableSorting: false,
    cell: (c) => formatDay(c.getValue() as string),
  },
  { accessorKey: "studentName", header: "Student", enableSorting: false },
  { accessorKey: "description", header: "Description", enableSorting: false },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: false,
    cell: (c) => (
      <Badge tone={TONE[c.getValue() as LedgerEntry["type"]]}>{String(c.getValue())}</Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    enableSorting: false,
    cell: (c) => {
      const v = c.getValue() as number;
      return (
        <span
          className={cn("font-semibold tabular-nums", v < 0 ? "text-maroon-600" : "text-green-600")}
        >
          {v > 0 ? "+" : ""}
          {formatINR(v)}
        </span>
      );
    },
  },
];

/** A5 plans and credits ledger. */
export function LedgerView() {
  const { params, set } = useUrlState();
  const type = params.get("type") ?? "";
  const urlQ = params.get("q") ?? "";
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 25);

  const [q, setQ] = useState(urlQ);
  const debounced = useDebounced(q, 300);
  useEffect(() => {
    if (debounced !== urlQ) set({ q: debounced }, { resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = useOpsLedger({ type, q: urlQ, page, pageSize });
  const t = query.data?.totals;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Plans & credits</h1>
        <SampleDataBadge />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Payments" value={t ? formatINR(t.payments) : "—"} tone="green" />
        <StatCard label="Refunds" value={t ? formatINR(t.refunds) : "—"} tone="maroon" />
        <StatCard label="Credits carried" value={t ? formatINR(t.credits) : "—"} />
        <StatCard label="Net" value={t ? formatINR(t.net) : "—"} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor="ledger-search" className="text-navy-400 mb-1 text-xs font-semibold">
            Search
          </label>
          <Input
            id="ledger-search"
            type="search"
            placeholder="Student or description"
            className="md:min-h-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          label="Type"
          placeholder="All types"
          value={type}
          onChange={(e) => set({ type: e.target.value }, { resetPage: true })}
          options={[
            { value: "payment", label: "Payments" },
            { value: "top-up", label: "Top-ups" },
            { value: "refund", label: "Refunds" },
            { value: "credit", label: "Credits" },
          ]}
        />
      </div>

      <DataTable
        caption="Ledger"
        columns={columns}
        data={query.data?.items ?? []}
        total={query.data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={(p) => set({ page: p })}
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="No entries"
        getRowId={(r) => r.id}
      />
    </div>
  );
}
