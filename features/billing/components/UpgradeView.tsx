"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProposedBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";
import { useUpgrade, useUpgradeQuote } from "../hooks/useBilling";

/** E8 upgrade mid-season: price after top-up credit (Proposed). */
export function UpgradeView() {
  const quote = useUpgradeQuote();
  const upgrade = useUpgrade();

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-xl p-4 md:p-8">
      <Link
        href={ROUTES.student.billing}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        Plan & billing
      </Link>
      <h1 className="font-display mt-2 text-3xl font-bold">Upgrade to Elite</h1>
      <div className="mt-6">{children}</div>
    </div>
  );

  const result = upgrade.data;

  if (result?.status === "paid") {
    return shell(
      <Card variant="feature" data-testid="upgrade-receipt">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <h2 className="font-display mt-3 text-2xl font-bold">You are on Elite</h2>
        <p className="text-navy-400 mt-1 text-sm">
          Paid {formatINR(result.amount)} · Receipt {result.receiptNo}
        </p>
        <Button asChild className="mt-5 w-full">
          <Link href={ROUTES.student.caseTrack}>Open Case Track</Link>
        </Button>
      </Card>,
    );
  }

  if (quote.isPending) return <PageSkeleton />;

  const qErr = quote.error instanceof ApiError ? quote.error : null;
  if (qErr?.code === "already_elite") {
    return shell(
      <Card variant="feature" data-testid="already-elite">
        <p className="font-semibold">You are already on Elite.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.student.caseTrack}>Open Case Track</Link>
        </Button>
      </Card>,
    );
  }
  if (quote.isError || !quote.data) return <ErrorCard onRetry={() => quote.refetch()} />;

  const q = quote.data;
  const err = upgrade.error instanceof ApiError ? upgrade.error : null;

  const full = q.seatsLeft === 0 || err?.code === "cohort_full";

  return shell(
    <>
      {result?.status === "failed" && (
        <div role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mb-4 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <XCircle className="size-5" aria-hidden /> Payment failed
          </p>
          <p>{result.message}</p>
        </div>
      )}
      {upgrade.isError && !full && (
        <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mb-4 p-4 text-sm">
          {err?.message ?? "Something went wrong. You have not been charged."}
        </p>
      )}
      <Card variant="feature">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-400">Elite plan</dt>
            <dd className="font-semibold tabular-nums">{formatINR(q.listPrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">Credit for unused {q.from} sessions</dt>
            <dd className="font-semibold text-green-600 tabular-nums">
              -{formatINR(q.topUpCredit)}
            </dd>
          </div>
          <div className="border-line flex justify-between border-t pt-3 text-base">
            <dt className="font-semibold">You pay</dt>
            <dd data-testid="payable" className="font-display text-2xl font-bold tabular-nums">
              {formatINR(q.payable)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 flex items-center gap-2 text-xs">
          <ProposedBadge />
          <span className="text-navy-400">Credit is based on sessions you have not used yet.</span>
        </p>
        {full ? (
          <div className="mt-5">
            <p className="text-maroon-600 text-sm font-semibold">Elite is full right now.</p>
            <Button asChild className="mt-2 w-full">
              <Link href={ROUTES.student.waitlist}>Join Waitlist</Link>
            </Button>
          </div>
        ) : (
          <Button
            className="mt-5 w-full"
            disabled={upgrade.isPending}
            onClick={() => upgrade.mutate()}
          >
            {upgrade.isPending
              ? "Processing…"
              : result?.status === "failed"
                ? `Retry Payment · ${formatINR(q.payable)}`
                : `Pay ${formatINR(q.payable)}`}
          </Button>
        )}
      </Card>
    </>,
  );
}
