"use client";

import Link from "next/link";
import { CheckCircle2, Check, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProposedBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";
import { formatDay } from "@/lib/utils/dates";
import { useBilling, useUpgrade, useUpgradeQuote } from "../hooks/useBilling";

/** E8 upgrade mid-season: next tier price minus what you paid minus top-ups bought (Proposed). */
export function UpgradeView() {
  const quote = useUpgradeQuote();
  const upgrade = useUpgrade();
  const billing = useBilling();

  const shell = (title: string, children: React.ReactNode) => (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link
        href={ROUTES.student.billing}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        Plan & billing
      </Link>
      <h1 className="font-display mt-2 text-3xl leading-tight font-bold md:text-[40px]">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );

  const result = upgrade.data;

  if (result?.status === "paid") {
    const elite = result.plan === "Elite";
    return shell(
      `You are on ${result.plan}`,
      <Card variant="feature" data-testid="upgrade-receipt" className="max-w-xl">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <h2 className="font-display mt-3 text-2xl font-bold">You are on {result.plan}</h2>
        <p className="text-navy-400 mt-1 text-sm">
          Paid {formatINR(result.amount)} · Receipt {result.receiptNo}
        </p>
        <Button asChild className="mt-5 w-full">
          <Link href={elite ? ROUTES.student.caseTrack : ROUTES.student.home}>
            {elite ? "Open Case Track" : "Go To Home"}
          </Link>
        </Button>
      </Card>,
    );
  }

  if (quote.isPending) return <PageSkeleton />;

  const qErr = quote.error instanceof ApiError ? quote.error : null;
  if (qErr?.code === "already_elite") {
    return shell(
      "You are already on Elite",
      <Card variant="feature" data-testid="already-elite" className="max-w-xl">
        <p className="font-semibold">You are already on Elite.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.student.caseTrack}>Open case track</Link>
        </Button>
      </Card>,
    );
  }
  if (quote.isError || !quote.data) return <ErrorCard onRetry={() => quote.refetch()} />;

  const q = quote.data;
  const err = upgrade.error instanceof ApiError ? upgrade.error : null;
  const full = q.seatsLeft === 0 || err?.code === "cohort_full";
  const ended = billing.data?.plan.status === "ended";
  const title = ended
    ? `${q.from} ended after P1. ${q.to} picks up from here.`
    : `You are on ${q.from}. ${q.to} picks up from here.`;

  return shell(
    title,
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <Card variant="feature">
        <h2 className="text-navy-400 text-xs font-bold tracking-[0.12em] uppercase">
          Your upgrade price
        </h2>
        {result?.status === "failed" && (
          <div role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mt-3 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <XCircle className="size-5" aria-hidden /> Payment failed
            </p>
            <p>{result.message}</p>
          </div>
        )}
        {upgrade.isError && !full && (
          <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-card mt-3 p-4 text-sm">
            {err?.message ?? "Something went wrong. You have not been charged."}
          </p>
        )}
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-400">
              {q.to} minus {q.from}
            </dt>
            <dd className="font-semibold tabular-nums">{formatINR(q.difference)}</dd>
          </div>
          {q.topUps.map((t) => (
            <div key={t.at} className="flex justify-between">
              <dt className="text-navy-400">
                {t.label} · {formatDay(t.at)}{" "}
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold tracking-wider text-green-600 uppercase">
                  Credited
                </span>
              </dt>
              <dd className="font-semibold text-green-600 tabular-nums">−{formatINR(t.amount)}</dd>
            </div>
          ))}
          <div className="border-line flex justify-between border-t pt-3 text-base">
            <dt className="font-semibold">You pay today</dt>
            <dd data-testid="payable" className="font-num text-3xl font-bold tabular-nums">
              {formatINR(q.payable)}
            </dd>
          </div>
        </dl>
        <p className="text-navy-400 mt-2 text-sm">
          Not {formatINR(q.difference)}. Credit applies within the same season only.
        </p>
        <p className="mt-2 flex items-center gap-2 text-xs">
          <ProposedBadge />
          <span className="text-navy-400">Upgrade pricing is not signed off.</span>
        </p>
        {full ? (
          <div className="mt-5">
            <p className="text-maroon-600 text-sm font-semibold">{q.to} is full right now.</p>
            <Button asChild className="mt-2 w-full md:w-auto">
              <Link href={ROUTES.student.waitlist}>Join waitlist</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button loading={upgrade.isPending} onClick={() => upgrade.mutate()}>
              {result?.status === "failed"
                ? `Retry payment · ${formatINR(q.payable)}`
                : `Upgrade for ${formatINR(q.payable)}`}
            </Button>
            <Button asChild variant="secondary">
              <Link href={ROUTES.student.billing}>Not now</Link>
            </Button>
          </div>
        )}
      </Card>

      <Card variant="inset">
        <h2 className="text-navy-400 text-xs font-bold tracking-[0.12em] uppercase">
          What unlocks today · {q.to}
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {q.unlocks.map((u) => (
            <li key={u} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
              {u}
            </li>
          ))}
        </ul>
        <p className="text-navy-400 mt-4 text-xs">
          Top-ups you buy later count toward upgrading a tier.
        </p>
      </Card>
    </div>,
  );
}
