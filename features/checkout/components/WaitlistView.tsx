"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { usePlans, useJoinWaitlist } from "@/features/plans/hooks/usePlans";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";

const box = "accent-maroon-600 mt-0.5 size-5 shrink-0";

/** E5 cohort full (e05.png). 24 h to claim, Season 1 price kept: Proposed. */
export function WaitlistView() {
  const join = useJoinWaitlist();
  const plans = usePlans("finals");
  const summers = usePlans("summers");
  const profile = useProfile();
  const [planId, setPlanId] = useState<"basic" | "premium" | "elite">("premium");
  const [alsoBasic, setAlsoBasic] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);

  const seats = plans.data?.seats;
  const summersLeft = summers.data
    ? Math.max(0, summers.data.seats.total - summers.data.seats.taken)
    : null;
  const options = plans.data?.items ?? [];
  const chosen = options.find((p) => p.id === planId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <PageHeader
          className="md:pr-0"
          title="Finals seats for Season 1 are full."
          subtitle="Season 1 pricing held until the cohort filled, and it has. Seats sometimes free up. Join the waitlist and you keep Season 1 pricing if one does."
        />
        <div
          role="group"
          aria-label="Track"
          className="bg-cream-soft rounded-card flex gap-1 self-start p-1 lg:self-end"
        >
          <span
            aria-current="true"
            className="flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold"
          >
            Finals
            <Badge tone="maroonSoft">Full</Badge>
          </span>
          <Link
            href={ROUTES.student.plans}
            className="text-navy-400 flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
          >
            Summers
            {summersLeft !== null && <Badge tone="green">{summersLeft} left</Badge>}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card variant="feature" className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>{seats?.label ?? "Finals seats, season 1"}</span>
              <span>{seats ? `${seats.taken} of ${seats.total} taken` : ""}</span>
            </div>
            <ProgressBar
              className="mt-2"
              label="Finals seats taken"
              value={seats?.taken ?? 0}
              max={seats?.total ?? 1}
            />
          </div>

          {join.data ? (
            <div role="status" className="py-6 text-center">
              <CheckCircle2 className="mx-auto size-10 text-green-600" aria-hidden />
              <h2 className="font-display mt-3 text-2xl font-bold">
                You are #{join.data.position}
              </h2>
              <p className="text-navy-400 mt-1 text-sm">
                When a seat opens you have {join.data.claimWindowHours} hours to claim it. Your
                Season 1 price is kept.
              </p>
              <Button asChild variant="secondary" className="mt-5">
                <Link href={ROUTES.student.home}>Go To Home</Link>
              </Button>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                join.mutate({
                  planId,
                  email: profile.data?.email ?? "riya.kulkarni@scmhrd.edu",
                });
              }}
            >
              <h2 className="font-display text-2xl font-bold">Join the finals waitlist</h2>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="wl-plan" className="mb-1 block text-sm font-semibold">
                    Plan you want
                  </label>
                  <select
                    id="wl-plan"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value as typeof planId)}
                    className="rounded-control border-line min-h-12 w-full border bg-white px-3"
                  >
                    {options.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {formatINR(p.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="wl-day0" className="mb-1 block text-sm font-semibold">
                    Your Day 0
                  </label>
                  <input
                    id="wl-day0"
                    readOnly
                    value={profile.data?.day0 ?? ""}
                    className="rounded-control border-line min-h-12 w-full border bg-white px-3"
                  />
                </div>
              </div>
              {planId !== "basic" && (
                <label className="flex min-h-11 items-start gap-3">
                  <input
                    type="checkbox"
                    className={box}
                    checked={alsoBasic}
                    onChange={(e) => setAlsoBasic(e.target.checked)}
                  />
                  Also offer me Basic if a {chosen?.name ?? "Premium"} seat doesn&apos;t open
                </label>
              )}
              <label className="flex min-h-11 items-start gap-3">
                <input
                  type="checkbox"
                  className={box}
                  checked={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.checked)}
                />
                WhatsApp me the moment a seat opens
              </label>
              {join.isError && (
                <p role="alert" className="text-maroon-600 text-sm">
                  Something went wrong. Please try again.
                </p>
              )}
              <Button type="submit" disabled={join.isPending} className="w-full md:w-auto">
                {join.isPending ? "Joining…" : "Join waitlist"}
              </Button>
              <p className="text-navy-400 text-sm">
                No payment now. When a seat opens you get 24 hours to take it before it goes to the
                next person.
              </p>
            </form>
          )}
        </Card>

        <aside className="space-y-4">
          <Card variant="feature" className="border-maroon-600 border-2 text-center">
            <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              After you join
            </p>
            <p className="font-num mt-3 text-6xl font-bold">
              <span className="text-navy-400 font-normal">#</span>
              {plans.data?.waitlistNext ?? ""}
            </p>
            <p className="text-navy-400 mt-1">in the finals queue</p>
            <p className="mt-3">
              <Badge tone="goldSoft">Proposed policy</Badge>
            </p>
          </Card>
          <Card variant="feature" className="space-y-3">
            <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Meanwhile, still free
            </p>
            <p>
              The CV Builder is free whether or not you buy a plan. Lock your CV now so you&apos;re
              ready if a seat opens.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href={ROUTES.student.cv}>Open CV Builder</Link>
            </Button>
          </Card>
          <Card variant="inset" className="p-5">
            <p>
              Seats close fifteen days before the process opens. After that the waitlist closes too.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
