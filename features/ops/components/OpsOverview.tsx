"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { formatINR } from "@/lib/utils/currency";
import { useCohort } from "../hooks/useOps";
import type { Cohort } from "../schemas";

function SeatCard({ seat }: { seat: Cohort["seats"][number] }) {
  const left = Math.max(0, seat.total - seat.taken);
  return (
    <Card variant="feature" className="p-5">
      <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.14em] uppercase">
        {seat.label}
      </p>
      <p className="font-display mt-4 text-5xl leading-none font-bold tabular-nums">
        {seat.taken}
        <span className="text-navy-400 ml-1.5 text-2xl font-normal">/ {seat.total}</span>
      </p>
      <ProgressBar className="mt-4 h-2.5" value={seat.taken} max={seat.total} label={seat.label} />
      <p className="text-navy-400 mt-3 text-sm">{left === 0 ? "Full" : `${left} left`}</p>
    </Card>
  );
}

/** "Free session → paid": three stacked gradient bars, each scaled to the first. */
function Funnel({ data }: { data: Cohort }) {
  const top = data.funnel[0]?.value || 1;
  return (
    <Card variant="feature">
      <h2 className="font-display text-2xl font-bold">Free session → paid</h2>
      <ul className="mt-5 space-y-2.5">
        {data.funnel.map((f) => (
          <li
            key={f.label}
            style={{ width: `${Math.max(18, (f.value / top) * 100)}%` }}
            className="flex h-10 items-center rounded-lg bg-gradient-to-r from-[var(--maroon-600)] to-[var(--gold-500)] px-4 text-sm font-bold whitespace-nowrap text-white"
          >
            {f.value} {f.label}
          </li>
        ))}
      </ul>
      <p className="text-navy-400 mt-5 text-sm">
        {data.conversionPct}% of attended sessions convert.
      </p>
    </Card>
  );
}

function Revenue({ data }: { data: Cohort }) {
  return (
    <Card variant="feature">
      <h2 className="font-display text-2xl font-bold">Revenue by tier</h2>
      <ul className="mt-4 space-y-3 text-[15px]">
        {data.revenue.lines.map((l) => (
          <li key={l.tier} className="flex justify-between gap-4">
            <span>
              {l.tier} · {l.count} × {formatINR(l.unit)}
            </span>
            <span className="font-semibold tabular-nums">{formatINR(l.amount)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-4">
          <span>Top-ups</span>
          <span className="font-semibold tabular-nums">{formatINR(data.revenue.topUps)}</span>
        </li>
      </ul>
      <div className="border-line mt-5 flex items-end justify-between gap-4 border-t pt-5">
        <span className="font-semibold">Season to date</span>
        <span data-testid="season-total" className="font-display text-4xl font-bold tabular-nums">
          {formatINR(data.revenue.total)}
        </span>
      </div>
    </Card>
  );
}

function NeedsAttention({ data }: { data: Cohort }) {
  return (
    <Card variant="feature">
      <h2 className="font-display text-2xl font-bold">Needs attention</h2>
      <ul className="divide-line mt-3 divide-y">
        {data.needsAttention.map((n) => (
          <li
            key={n.id}
            data-testid={`attn-${n.id}`}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold">{n.title}</p>
              <p className="text-navy-400 text-sm">{n.detail}</p>
            </div>
            <Button asChild variant="secondary" size="sm" className="self-start sm:self-center">
              <Link href={n.href} data-testid={`attn-${n.id}-action`}>
                {n.action}
                <span className="sr-only"> for {n.title}</span>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ThisWeek({ data }: { data: Cohort }) {
  const w = data.thisWeek;
  const rows: [string, string][] = [
    ["Sessions scheduled", String(w.sessionsScheduled)],
    ["Free sessions", String(w.freeSessions)],
    ["Feedback overdue", String(w.feedbackOverdue)],
    ["Panelists active", `${w.panelistsActive} of ${w.panelistsTotal}`],
  ];
  return (
    <Card variant="navy" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 size-56 rounded-full bg-[var(--maroon-600)]/30 blur-3xl"
      />
      <h2 className="text-gold-300 relative text-[13px] font-semibold tracking-[0.16em] uppercase">
        This week
      </h2>
      <dl className="relative mt-4 space-y-3.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-[15px]">
            <dt className="text-white/70">{label}</dt>
            <dd className="font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="relative mt-5 border-t border-white/15 pt-4 text-sm text-white/70">
        Finals Day 0 in {data.day0.daysLeft} days.
      </p>
    </Card>
  );
}

/** A1 cohort overview (a01.png). */
export function OpsOverview() {
  const { data, isPending, isError, refetch } = useCohort();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8 xl:px-10">
      <PageHeader eyebrow="Mon 5 Oct 2026" pill="Sample data" title="Cohort overview" />

      <section aria-label="Seats" className="grid gap-4 md:grid-cols-3">
        {data.seats.map((s) => (
          <SeatCard key={s.id} seat={s} />
        ))}
      </section>
      <p className="text-navy-400 -mt-2 text-[15px]">{data.seatsNote}</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Funnel data={data} />
        <Revenue data={data} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_420px]">
        <NeedsAttention data={data} />
        <div>
          <ThisWeek data={data} />
        </div>
      </div>
    </div>
  );
}
