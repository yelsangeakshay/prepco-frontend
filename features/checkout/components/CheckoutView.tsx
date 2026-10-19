"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard, Timer, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { usePlans, useCheckout } from "@/features/plans/hooks/usePlans";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";
import { formatDay } from "@/lib/utils/dates";

function useCountdown(untilIso: string | null) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!untilIso) return;
    const tick = () => setLeft(Math.max(0, new Date(untilIso).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [untilIso]);
  const m = Math.floor(left / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return { expired: untilIso !== null && left === 0, label: `${m}:${String(s).padStart(2, "0")}` };
}

function SeatHold({ until }: { until: string }) {
  const { label, expired } = useCountdown(until);
  return (
    <p className="flex items-center gap-2 text-sm font-semibold" aria-live="off">
      <Timer className="size-4" aria-hidden />
      {expired ? "Your seat hold has expired" : `Seat held for ${label}`}
    </p>
  );
}

/** S4 checkout. E4: payment failed (seat held 15 min, Proposed) or success receipt. */
export function CheckoutView({ planId }: { planId: string }) {
  const plans = usePlans();
  const pay = useCheckout();

  if (plans.isPending) return <PageSkeleton />;
  if (plans.isError || !plans.data) return <ErrorCard onRetry={() => plans.refetch()} />;

  const plan = plans.data.items.find((p) => p.id === planId);
  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <div className="mt-6">{children}</div>
    </div>
  );

  if (!plan) {
    return shell(
      <Card>
        <p className="font-semibold">We could not find that plan.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.student.plans}>See Plans</Link>
        </Button>
      </Card>,
    );
  }

  const result = pay.data;
  const err = pay.error instanceof ApiError ? pay.error : null;

  if (result?.status === "paid") {
    return shell(
      <Card variant="feature" data-testid="receipt">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <h2 className="font-display mt-3 text-2xl font-bold">Payment received</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-400">Plan</dt>
            <dd className="font-semibold">{result.planName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">Amount</dt>
            <dd className="font-semibold">{formatINR(result.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">Receipt</dt>
            <dd className="font-semibold">{result.receiptNo}</dd>
          </div>
          {result.paidAt && (
            <div className="flex justify-between">
              <dt className="text-navy-400">Date</dt>
              <dd className="font-semibold">{formatDay(result.paidAt)}</dd>
            </div>
          )}
        </dl>
        <Button asChild className="mt-6 w-full">
          <Link href={ROUTES.student.home}>Go To Home</Link>
        </Button>
      </Card>,
    );
  }

  if (err?.code === "cohort_full") {
    return shell(
      <Card variant="feature">
        <p className="font-display text-xl font-bold">{plan.name} is full</p>
        <p className="text-navy-400 mt-1 text-sm">Join the waitlist and keep the Season 1 price.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.student.waitlist}>Join Waitlist</Link>
        </Button>
      </Card>,
    );
  }

  return shell(
    <>
      {result?.status === "failed" && (
        <div role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mb-4 p-4">
          <p className="flex items-center gap-2 font-semibold">
            <XCircle className="size-5" aria-hidden /> Payment failed
          </p>
          <p className="mt-1 text-sm">{result.failureReason}</p>
          {result.seatHeldUntil && <SeatHold until={result.seatHeldUntil} />}
        </div>
      )}
      {pay.isError && !err?.code?.startsWith("cohort") && (
        <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mb-4 p-4 text-sm">
          {err?.message ?? "Something went wrong. You have not been charged."}
        </p>
      )}
      <Card variant="feature">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
          Order summary
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
          <p className="font-display text-2xl font-bold">{formatINR(plan.price)}</p>
        </div>
        <p className="text-navy-400 text-sm">{plan.tagline}</p>
        <Button
          className="mt-6 w-full"
          disabled={pay.isPending}
          onClick={() => pay.mutate(plan.id)}
        >
          <CreditCard className="size-4" aria-hidden />
          {pay.isPending
            ? "Processing…"
            : result?.status === "failed"
              ? `Retry Payment · ${formatINR(plan.price)}`
              : `Pay ${formatINR(plan.price)}`}
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link href={ROUTES.student.plans}>Choose A Different Plan</Link>
        </Button>
      </Card>
    </>,
  );
}
