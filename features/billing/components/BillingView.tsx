"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProposedBadge } from "@/components/shared/Badges";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/currency";
import { formatDay, formatDayYear } from "@/lib/utils/dates";
import { notify } from "@/lib/utils/notify";
import { useBilling, useBuyTopUp, useUpgradeQuote } from "../hooks/useBilling";
import type { Billing } from "../schemas";

const eyebrow = "text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase";

const ROW_PILL: Record<
  Billing["entitlements"][number]["state"],
  { label: string; tone: "green" | "goldSoft" | "neutral" }
> = {
  used: { label: "Used", tone: "green" },
  booked: { label: "", tone: "goldSoft" },
  scheduled: { label: "", tone: "neutral" },
  unbooked: { label: "Not booked", tone: "neutral" },
  active: { label: "Active", tone: "green" },
};

/** S14 plan and billing (s14.png). */
export function BillingView() {
  const { data, isPending, isError, refetch } = useBilling();
  const quote = useUpgradeQuote();
  const buy = useBuyTopUp();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const { plan, credits, invoices } = data;
  const ended = plan.status === "ended";
  const free = plan.id === "free";
  const q = quote.data;
  const toElite = q?.to === "Elite";

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <PageHeader eyebrow="Account" title="Plan & billing" />

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

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card variant="feature" className="border-maroon-600 space-y-4 border-2 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className={eyebrow}>
                {plan.name}
                <span className="md:hidden"> · Finals</span>
              </p>
              {!free && (
                <Badge tone="neutral" className="hidden text-[11px] md:inline-flex">
                  {data.season}
                </Badge>
              )}
            </div>
            {plan.paid > 0 && data.paidAt && (
              <p className="text-navy-400 hidden text-sm md:block">
                Paid {formatINR(plan.paid)} · {formatDayYear(data.paidAt).split(", ")[1]}
              </p>
            )}
            <Badge tone={ended ? "maroonSoft" : "green"} className="md:hidden">
              {ended ? "Ended" : "Active"}
            </Badge>
          </div>

          {plan.paid > 0 && (
            <div className="md:hidden">
              <p className="font-display text-4xl font-bold">{formatINR(plan.paid)}</p>
              {data.paidAt && (
                <p className="text-navy-400 mt-1">
                  Paid {formatDayYear(data.paidAt).split(", ")[1]} · Season 1
                </p>
              )}
            </div>
          )}

          {data.tagline ? (
            <h2 className="font-display hidden text-2xl leading-snug font-bold md:block md:text-[28px]">
              {data.tagline}
            </h2>
          ) : free ? (
            <h2 className="font-display text-2xl leading-snug font-bold">
              You are on the free plan.
            </h2>
          ) : null}

          {data.entitlements.length > 0 && (
            <ul className="hidden md:block">
              {data.entitlements.map((e) => {
                const pill = ROW_PILL[e.state];
                return (
                  <li
                    key={e.id}
                    className="border-line flex items-center justify-between gap-3 border-b py-3 first:pt-0 last:border-0"
                  >
                    <span>{e.label}</span>
                    <Badge tone={pill.tone} className="shrink-0">
                      {pill.label || e.when}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}

          {credits.total > 0 && (
            <div className="md:hidden">
              <div className="mb-2 flex justify-between">
                <span>Runway sessions</span>
                <span data-testid="credits" className="font-semibold tabular-nums">
                  {credits.used} of {credits.total} done
                </span>
              </div>
              <ProgressBar value={credits.used} max={credits.total} label="Sessions done" />
              {credits.carriedOver > 0 && (
                <p className="text-navy-400 mt-2 text-xs">
                  {formatINR(credits.carriedOver)} carried over.
                </p>
              )}
            </div>
          )}
          {free && (
            <Button asChild>
              <Link href={ROUTES.student.plans}>Choose a plan</Link>
            </Button>
          )}
        </Card>

        {data.canUpgrade && q && !free && (
          <Card
            variant="navy"
            className="order-3 flex flex-col gap-4 p-6 lg:order-none lg:min-h-full"
          >
            <p className="text-gold-300 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Upgrade to {q.to}
            </p>
            <h2 className="font-display hidden text-2xl leading-snug font-bold md:block">
              {toElite
                ? "Add the case competition track and the lowest top-up rates all season."
                : `Add ${q.unlocks.slice(0, 2).join(" and ").toLowerCase()}.`}
            </h2>
            <p className="text-lg md:hidden">
              {toElite
                ? "Case competition track + lowest top-up rates."
                : q.unlocks.slice(0, 2).join(" + ")}
            </p>
            <dl className="hidden space-y-2 md:block">
              <div className="flex justify-between text-white/70">
                <dt>
                  {q.to} minus {q.from}
                </dt>
                <dd>{formatINR(q.difference)}</dd>
              </div>
              <div className="flex justify-between border-b border-white/15 pb-3 text-white/70">
                <dt>Top-up credit</dt>
                <dd>– {formatINR(q.topUpCredit)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="font-semibold">You pay</dt>
                <dd className="font-display text-4xl font-bold" data-testid="billing-payable">
                  {formatINR(q.payable)}
                </dd>
              </div>
            </dl>
            <Button
              asChild
              variant="secondary"
              className="mt-auto w-full border-transparent bg-[var(--cream)]"
            >
              <Link href={ROUTES.student.billingUpgrade}>
                <span className="md:hidden">Upgrade · {formatINR(q.payable)}</span>
                <span className="hidden md:inline">Upgrade to {q.to}</span>
              </Link>
            </Button>
          </Card>
        )}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card variant="feature" className="order-1 md:p-8">
          <h2 className="font-display hidden text-2xl font-bold md:block">
            Top-ups at your plan&apos;s rate
          </h2>
          <h2 className={cn(eyebrow, "md:hidden")}>Top-ups at your rate</h2>
          <p className="text-navy-400 mt-1 hidden md:block">
            Anything you spend on top-ups counts toward upgrading a tier.
          </p>
          <ul className="mt-3">
            {data.topUps.map((t) => (
              <li
                key={t.id}
                className="border-line flex items-center justify-between gap-3 border-b py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-semibold md:font-bold">{t.label}</p>
                  <p className="text-navy-400 hidden text-sm md:block">{t.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "font-semibold",
                      t.price === null && "text-navy-400 text-sm font-normal",
                    )}
                  >
                    {t.price === null ? "Rate TBD" : formatINR(t.price)}
                  </span>
                  <Button
                    variant="secondary"
                    aria-label={`Buy ${t.label}`}
                    disabled={buy.isPending}
                    onClick={() =>
                      t.price === null
                        ? notify("This top-up has no price yet")
                        : buy.mutate(t.id, {
                            onSuccess: () =>
                              notify(
                                `${t.label} added. ${formatINR(t.price!)} counts toward an upgrade.`,
                              ),
                          })
                    }
                  >
                    Buy
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="order-2 space-y-4">
          <Card variant="inset" className="hidden p-6 md:block">
            <p className={eyebrow}>How upgrade credit works</p>
            <p className="mt-2 text-lg">
              If you&apos;ve spent ₹1,799 on Basic top-ups, moving to Premium costs you ₹2,201, not
              ₹4,000. Top-ups count toward an upgrade within the same season.
            </p>
          </Card>
          <Card className="flex gap-3 p-5">
            <Shield className="text-maroon-600 mt-1 size-5 shrink-0" aria-hidden />
            <p className="text-navy-400">
              <strong className="text-navy-900">
                <span className="md:hidden">Not placed?</span>
                <span className="hidden md:inline">If you don&apos;t get placed,</span>
              </strong>{" "}
              <span className="md:hidden">
                Your fee carries forward as full credit to the next season. No cash refund.
              </span>
              <span className="hidden md:inline">
                your fee carries forward as full credit to the next season, and we keep working with
                you off-campus at no extra cost. No cash refund.
              </span>
            </p>
          </Card>
        </div>
      </div>

      <Card variant="feature" className="order-4 md:p-8">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-bold">Invoices</h2>
          <ProposedBadge />
        </div>
        {invoices.length === 0 ? (
          <EmptyState title="No payments yet" body="Receipts appear here after you buy a plan." />
        ) : (
          <ul className="mt-3">
            <li
              aria-hidden
              className="text-navy-400 hidden grid-cols-[1.1fr_2.2fr_1fr_1fr_0.8fr] gap-3 px-1 pb-2 text-[11px] font-bold tracking-[0.14em] uppercase md:grid"
            >
              <span>Date</span>
              <span>Item</span>
              <span>Amount</span>
              <span>Status</span>
              <span />
            </li>
            {invoices.map((i) => (
              <li
                key={i.id}
                className="border-line grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t px-1 py-3 md:grid-cols-[1.1fr_2.2fr_1fr_1fr_0.8fr] md:gap-3"
              >
                <span className="text-navy-400 order-3 text-sm md:order-none md:text-base md:text-inherit">
                  {formatDayYear(i.at).split(", ")[1]}
                  {i.receiptNo && <span className="md:hidden"> · {i.receiptNo}</span>}
                </span>
                <span className="order-1 font-medium md:order-none md:font-normal">
                  {i.description}
                </span>
                <span className="order-2 text-right font-semibold tabular-nums md:order-none md:text-left md:font-normal">
                  {formatINR(i.amount)}
                </span>
                <span className="order-4 justify-self-end md:order-none md:justify-self-start">
                  <Badge tone={i.status === "paid" ? "green" : "neutral"}>
                    {i.status === "paid" ? "Paid" : "No charge"}
                  </Badge>
                </span>
                <span className="order-5 col-span-2 md:order-none md:col-span-1 md:text-right">
                  {i.status === "paid" && (
                    <button
                      type="button"
                      aria-label={`Download invoice ${i.description}`}
                      onClick={() => notify("Invoice download is not connected in this preview")}
                      className="text-maroon-600 min-h-11 font-semibold underline"
                    >
                      Download
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
