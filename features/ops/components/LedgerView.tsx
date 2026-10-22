"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LazyDataTable as DataTable } from "@/components/shared/LazyDataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProposedBadge } from "@/components/shared/Badges";
import { formatINR } from "@/lib/utils/currency";
import { formatDay } from "@/lib/utils/dates";
import { useDebounced } from "@/lib/utils/useDebounced";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useOpsLedger } from "../hooks/useOps";
import type { LedgerEntry } from "../schemas";
import { statusTone } from "@/lib/status";

const PLAN_ITEM = /^(Basic|Premium|Elite) plan/;
const PLAN_TONE = {
  Basic: statusTone("basic"),
  Premium: statusTone("premium"),
  Elite: statusTone("elite"),
} as const;

const STATUS = {
  payment: { label: "Paid", tone: statusTone("paid") },
  "top-up": { label: "Paid", tone: statusTone("paid") },
  refund: { label: "Refunded", tone: statusTone("refunded") },
  credit: { label: "Credit", tone: statusTone("credit") },
} as const;

const columns: ColumnDef<LedgerEntry, unknown>[] = [
  {
    accessorKey: "at",
    header: "Date",
    enableSorting: false,
    cell: (c) => formatDay(c.getValue() as string),
  },
  {
    accessorKey: "studentName",
    header: "Student",
    enableSorting: false,
    cell: (c) => <span className="font-semibold">{String(c.getValue())}</span>,
  },
  {
    accessorKey: "description",
    header: "Item",
    enableSorting: false,
    cell: (c) => {
      const d = String(c.getValue());
      const plan = PLAN_ITEM.exec(d)?.[1] as keyof typeof PLAN_TONE | undefined;
      if (!plan) return d;
      return (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <Badge tone={PLAN_TONE[plan]}>{plan}</Badge>
          Season 1
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    enableSorting: false,
    cell: (c) => {
      const v = c.getValue() as number;
      return <span className="tabular-nums">{formatINR(v)}</span>;
    },
  },
  {
    id: "credit",
    header: "Upgrade credit",
    enableSorting: false,
    cell: (c) => {
      const e = c.row.original;
      if (e.type === "top-up") return <span>Counts toward upgrade</span>;
      if (e.type === "credit") return <span>Carried to next season</span>;
      return <span className="text-navy-400">—</span>;
    },
  },
  {
    accessorKey: "type",
    header: "Status",
    enableSorting: false,
    cell: (c) => {
      const s = STATUS[c.getValue() as LedgerEntry["type"]];
      return <Badge tone={s.tone}>{s.label}</Badge>;
    },
  },
];

function Figure({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card variant="feature" className="p-5">
      <p className="text-navy-400 text-sm">{label}</p>
      <p className="font-num mt-1 text-3xl leading-tight font-bold tabular-nums">{value}</p>
      <p className="text-navy-400 mt-1 text-sm">{hint}</p>
    </Card>
  );
}

/** A5 plans, top-ups and credits ledger (a05.png). */
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
  const money = (n: number | undefined) => (n === undefined ? "—" : formatINR(n));

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <PageHeader eyebrow="Season 1 ledger" pill="Sample data" title="Plans, top-ups & credits" />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Figure
          label="Plan revenue"
          value={money(t?.planRevenue)}
          hint={`${t?.plans ?? "—"} plans`}
        />
        <Figure label="Top-ups" value={money(t?.topUps)} hint="Counts toward upgrades" />
        <Figure
          label="Upgrade credit outstanding"
          value={money(t?.upgradeCredit)}
          hint="Usable this season only"
        />
        <Figure
          label="Carried to next season"
          value={money(t?.credits)}
          hint="Not-placed credit, after Day 2"
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
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
        loading={query.isPending}
        error={query.isError}
        onRetry={() => query.refetch()}
        emptyTitle="No entries"
        getRowId={(r) => r.id}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Card variant="inset" className="p-6">
          <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
            Upgrade rule
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            Anything spent on top-ups counts toward upgrading a tier within the same season.
            Karan&apos;s ₹1,799 top-up brings Premium from ₹4,000 to ₹2,201.
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Placement credit
            </p>
            <ProposedBadge />
          </div>
          <p className="mt-3 text-[15px] leading-relaxed">
            If a student isn&apos;t placed, the fee carries forward as full credit to the next
            season. No cash refund. Credits appear here after Day 2.
          </p>
        </Card>
      </div>
    </div>
  );
}
