"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";
import { notify } from "@/lib/utils/notify";
import { useCaseTrack } from "../hooks/useJourney";
import type { CaseTrack } from "../schemas";
import { statusTone, type StatusTone } from "@/lib/status";

const STATE_PILL: Record<
  Exclude<CaseTrack["steps"][number]["state"], "upload">,
  { label: string; tone: StatusTone }
> = {
  done: { label: "Done", tone: statusTone("done") },
  book: { label: "Book", tone: statusTone("book") },
  later: { label: "Later", tone: statusTone("later") },
  "on-placing": { label: "Unlocks on placing", tone: statusTone("on-placing") },
};

const eyebrow = "text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase";

/** S12 case track (s12.png). Anyone below Elite sees the sample view under an upgrade banner. */
export function CaseTrackView() {
  const { data, isPending, isError, refetch } = useCaseTrack();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const seatsPct = Math.round(((data.seats.total - data.seats.left) / data.seats.total) * 100);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <PageHeader
        eyebrow="Route one · Case competitions"
        pill="Elite"
        pillClassName="bg-gold-500 text-navy-900"
        title="The fastest route to an offer before the process even opens."
      />

      {data.upgrade && (
        <Card
          variant="navy"
          data-testid="case-locked"
          className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-gold-300 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Preview · Included with Elite
            </p>
            <p className="mt-2 max-w-2xl text-lg">
              You&apos;re on {data.plan}. The case track alone is {formatINR(data.upgrade.alone)};
              Elite costs {formatINR(data.upgrade.moreThanPlan)} more than {data.plan} and adds it,
              plus lower top-up rates all season.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            className="shrink-0 border-transparent bg-[var(--cream)]"
          >
            <Link href={ROUTES.student.billingUpgrade}>
              Upgrade to Elite · {formatINR(data.upgrade.moreThanPlan)}
            </Link>
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card variant="feature" className="md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">
              Case track · runs in parallel from {data.startWeek}
            </h2>
            <Badge tone="neutral">Sample view</Badge>
          </div>
          <ol data-testid="case-modules" className="mt-4">
            {data.steps.map((s) => (
              <li
                key={s.id}
                className="border-line flex items-center gap-4 border-t py-4 first:border-t-0"
              >
                {s.n !== null ? (
                  <span
                    aria-hidden
                    className="bg-gold-500/15 font-display flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-[#7a5c14]"
                  >
                    {s.n}
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="bg-navy-900 text-gold-500 flex size-12 shrink-0 items-center justify-center rounded-full"
                  >
                    <Star className="size-5 fill-current" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-navy-400 text-sm">{s.detail}</p>
                </div>
                {s.state === "upload" ? (
                  <Button
                    variant="secondary"
                    onClick={() => notify("Deck upload is not connected in this preview")}
                  >
                    Upload deck
                  </Button>
                ) : (
                  <Badge tone={STATE_PILL[s.state].tone} className="shrink-0">
                    {STATE_PILL[s.state].label}
                  </Badge>
                )}
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card variant="feature">
            <p className={eyebrow}>What&apos;s in the track</p>
            <dl className="mt-3 space-y-2">
              {data.summary.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3">
                  <dt>{r.label}</dt>
                  <dd className="font-bold">{r.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card variant="inset" className="space-y-2 p-5">
            <p className={eyebrow}>Route one</p>
            <p className="font-bold">Compete → PPI → Offer</p>
            <p>Win or place well, convert the PPI, and skip the queue entirely.</p>
          </Card>
          <Card variant="feature">
            <p className={eyebrow}>Elite seats</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>Case track capped</span>
              <span className="font-bold">
                {data.seats.left} of {data.seats.total} left
              </span>
            </div>
            <ProgressBar className="mt-2" value={seatsPct} label="Elite seats taken" />
          </Card>
        </div>
      </div>
    </div>
  );
}
