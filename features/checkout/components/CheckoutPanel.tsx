"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProposedBadge } from "@/components/shared/Badges";
import { useRunway } from "@/features/runway/hooks/useRunway";
import { useCheckout } from "@/features/plans/hooks/usePlans";
import {
  PAY_METHODS,
  PAY_METHOD_LABEL,
  type PayMethod,
  type Plan,
  type Track,
} from "@/features/plans/schemas";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";

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

const NEXT_STEPS = [
  "Book your profiling and strategy call.",
  "Lock your CV with an expert review.",
  "Pick a slot for P1 and get your brief.",
];

const FOOTNOTE =
  "If you don't get placed, your fee carries forward as full credit to the next season. No cash refund.";

/** Checkout section (s04) plus the E4 failed and success states. */
export function CheckoutPanel({ plan, track }: { plan: Plan; track: Track }) {
  const pay = useCheckout();
  const runway = useRunway();
  const [method, setMethod] = useState<PayMethod>("upi");
  const result = pay.data;
  const err = pay.error instanceof ApiError ? pay.error : null;
  const hold = useCountdown(result?.status === "failed" ? result.seatHeldUntil : null);
  const firstName = runway.data?.student.name.split(" ")[0] ?? "there";
  const trackLabel = track === "finals" ? "Finals" : "Summers";

  if (result?.status === "paid") {
    return (
      <Card variant="feature" data-testid="receipt">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <h2 className="font-display mt-3 text-3xl font-bold">You&apos;re in, {firstName}.</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-400">Paid</dt>
            <dd className="font-semibold">
              {formatINR(result.amount)} · {result.planName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">Reference</dt>
            <dd className="font-semibold">{result.receiptNo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">Date</dt>
            <dd className="font-semibold">10 Sep 2026</dd>
          </div>
        </dl>
        <h3 className="text-navy-400 mt-6 text-xs font-bold tracking-[0.12em] uppercase">
          What happens next
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {NEXT_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={ROUTES.student.home}>Book profiling call</Link>
          </Button>
          <Button variant="secondary">Download receipt</Button>
        </div>
      </Card>
    );
  }

  if (err?.code === "cohort_full") {
    return (
      <Card variant="feature">
        <p className="font-display text-xl font-bold">{plan.name} is full</p>
        <p className="text-navy-400 mt-1 text-sm">Join the waitlist and keep the Season 1 price.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.student.waitlist}>Join Waitlist</Link>
        </Button>
      </Card>
    );
  }

  const failed = result?.status === "failed";
  const methodLabel = PAY_METHOD_LABEL[method];

  return (
    <section aria-labelledby="checkout-h" className="grid gap-4 md:grid-cols-[1fr_340px]">
      <Card variant="feature">
        <h2 id="checkout-h" className="font-display text-2xl font-bold">
          Payment
        </h2>
        {failed && (
          <div role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mt-4 p-4">
            <p className="font-semibold">{result.failureTitle ?? "Payment failed"}</p>
            <p className="mt-1 text-sm">{result.failureReason}</p>
            {result.seatHeldUntil && (
              <div className="mt-3 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <Timer className="size-4" aria-hidden />
                  {hold.expired
                    ? "Your seat hold has expired"
                    : `Your seat is held for ${hold.label}`}
                </p>
                <p>
                  {plan.name} · {trackLabel} · {formatINR(plan.price)} · Season 1 price kept
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs">
                  <ProposedBadge /> Policy
                </p>
              </div>
            )}
            <p className="mt-3 text-xs">Stuck? support@theprep.co.in, with reference PC-24817.</p>
          </div>
        )}
        {pay.isError && err?.code !== "cohort_full" && (
          <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mt-4 p-4 text-sm">
            {err?.message ?? "Something went wrong. You have not been charged."}
          </p>
        )}
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Payment method</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {PAY_METHODS.map((m) => (
              <label
                key={m}
                className="border-line flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm"
              >
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={method === m}
                  onChange={() => setMethod(m)}
                />
                Pay with {PAY_METHOD_LABEL[m]}
              </label>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-2 text-xs">
            <ProposedBadge /> <span className="text-navy-400">Payment provider TBD</span>
          </p>
        </fieldset>
        <p className="bg-cream-soft rounded-card mt-4 p-3 text-sm">{FOOTNOTE}</p>
      </Card>

      <Card variant="feature">
        <h2 className="text-navy-400 text-xs font-bold tracking-[0.12em] uppercase">
          Order summary
        </h2>
        <p className="mt-2 font-semibold">
          {plan.name} · {trackLabel} · Season 1
        </p>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-400">List price</dt>
            <dd>
              <s>{formatINR(plan.listPrice)}</s>
            </dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd>{formatINR(plan.price)}</dd>
          </div>
        </dl>
        <Button
          className="mt-4 w-full"
          disabled={pay.isPending}
          onClick={() => pay.mutate({ planId: plan.id, method })}
        >
          {pay.isPending
            ? "Processing…"
            : failed
              ? `Try again with ${methodLabel}`
              : `Pay ${formatINR(plan.price)} →`}
        </Button>
        {failed && method !== "card" && (
          <Button
            variant="secondary"
            className="mt-2 w-full"
            disabled={pay.isPending}
            onClick={() => {
              setMethod("card");
              pay.mutate({ planId: plan.id, method: "card" });
            }}
          >
            Pay by card instead
          </Button>
        )}
        <p className="text-navy-400 mt-3 text-xs">
          Top-ups you buy later count toward upgrading a tier.
        </p>
      </Card>
    </section>
  );
}
