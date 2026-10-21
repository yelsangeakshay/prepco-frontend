"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { EliteBadge, SampleDataBadge } from "@/components/shared/Badges";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { LedgerRow } from "@/features/ops/ledger/components/LedgerRow";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";
import { formatDay } from "@/lib/utils/dates";
import { useBilling } from "../hooks/useBilling";

/** S14 plan and billing. */
export function BillingView() {
  const { data, isPending, isError, refetch } = useBilling();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const { plan, credits, invoices } = data;
  const ended = plan.status === "ended";

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Plan & billing</h1>
        <SampleDataBadge />
      </div>

      {ended && (
        <div
          role="note"
          data-testid="basic-ended"
          className="bg-maroon-100 text-maroon-600 rounded-card p-4 text-sm"
        >
          <p className="font-semibold">
            Your {plan.name} plan ended{plan.endedAt ? ` on ${formatDay(plan.endedAt)}` : ""}
          </p>
          <p>All {credits.total} sessions are used. Upgrade to keep your runway going.</p>
        </div>
      )}

      <Card variant="feature">
        <div className="flex flex-wrap items-start justify-between gap-3 md:pr-72">
          <div>
            <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
              Current plan
            </p>
            <p className="font-display mt-1 flex items-center gap-2 text-3xl font-bold">
              {plan.name}
              {plan.id === "elite" && <EliteBadge />}
            </p>
            {plan.paid > 0 && <p className="text-navy-400 text-sm">Paid {formatINR(plan.paid)}</p>}
          </div>
          {data.canUpgrade && (
            <Button asChild>
              <Link href={ROUTES.student.billingUpgrade}>
                {plan.id === "free" ? "Choose A Plan" : "Upgrade To Elite"}
              </Link>
            </Button>
          )}
        </div>
        {credits.total > 0 && (
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">Runway sessions</span>
              <span data-testid="credits" className="tabular-nums">
                {credits.used} of {credits.total} used
              </span>
            </div>
            <ProgressBar value={credits.used} max={credits.total} label="Sessions used" />
            {credits.carriedOver > 0 && (
              <p className="text-navy-400 mt-2 text-xs">
                {formatINR(credits.carriedOver)} carried over.
              </p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display mb-2 text-xl font-bold">Receipts</h2>
        {invoices.length === 0 ? (
          <EmptyState title="No payments yet" body="Receipts appear here after you buy a plan." />
        ) : (
          invoices.map((i) => (
            <LedgerRow
              key={i.id}
              date={`${formatDay(i.at)} · ${i.receiptNo}`}
              description={i.description}
              amount={i.amount}
            />
          ))
        )}
      </Card>
    </div>
  );
}
