"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { FunnelBars } from "@/components/shared/FunnelBars";
import { PageSkeleton, Skeleton } from "@/components/shared/Skeletons";
import { StatCard } from "@/components/shared/StatCard";
import { SeatGauge } from "@/features/ops/roster/components/SeatGauge";
import { formatINR } from "@/lib/utils/currency";
import { useCohort } from "../hooks/useOps";

const RevenueChart = dynamic(() => import("./Charts").then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full" />,
});
const WeekChart = dynamic(() => import("./Charts").then((m) => m.WeekChart), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});

/** A1 cohort overview. */
export function OpsOverview() {
  const { data, isPending, isError, refetch } = useCohort();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Cohort overview</h1>
        <p className="text-navy-400 text-sm">
          {data.season} · Day 0 {data.day0.label} · {data.day0.daysLeft} days to go
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={data.totals.students.toLocaleString("en-IN")} />
        <StatCard label="Paid" value={data.totals.paid.toLocaleString("en-IN")} tone="green" />
        <StatCard label="Revenue" value={formatINR(data.totals.revenue)} />
        <StatCard label="Days to Day 0" value={data.day0.daysLeft} />
      </div>

      <section aria-labelledby="attn" className="space-y-3">
        <h2 id="attn" className="font-display text-xl font-bold">
          Needs attention
        </h2>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.needsAttention.map((n) => (
            <li key={n.id}>
              <Link href={n.href} data-testid={`attn-${n.id}`}>
                <Card className="hover:bg-cream-soft flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{n.title}</span>
                  <Badge tone={n.count > 0 && n.tone === "maroon" ? "maroon" : "neutral"}>
                    {n.count}
                  </Badge>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="seats" className="space-y-3">
        <h2 id="seats" className="font-display text-xl font-bold">
          Seats
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {data.seats.map((s) => (
            <SeatGauge key={s.plan} label={s.plan} taken={s.taken} total={s.total} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="feature">
          <h2 className="font-display mb-4 text-xl font-bold">Free to paid</h2>
          <FunnelBars stages={data.funnel} />
        </Card>
        <Card variant="feature">
          <h2 className="font-display mb-2 text-xl font-bold">Revenue by tier</h2>
          <RevenueChart data={data.revenueByTier} />
          <ul className="mt-3 space-y-1 text-sm">
            {data.revenueByTier.map((r) => (
              <li key={r.tier} className="flex justify-between">
                <span>
                  {r.tier} <span className="text-navy-400">· {r.count} students</span>
                </span>
                <span className="font-semibold tabular-nums">{formatINR(r.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card variant="feature">
        <h2 className="font-display mb-2 text-xl font-bold">This week</h2>
        <WeekChart data={data.thisWeek} />
        <p className="text-navy-400 mt-2 text-xs">Gold = panels still without a panelist.</p>
      </Card>
    </div>
  );
}
