"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Skeleton } from "@/components/shared/Skeletons";
import { ProposedBadge } from "@/components/shared/Badges";
import { CheckoutPanel } from "@/features/checkout/components/CheckoutPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { usePlans } from "../hooks/usePlans";
import { TRACKS, type Plan, type Track } from "../schemas";
import { PlanCard } from "./PlanCard";

const TRACK_LABEL: Record<Track, string> = { finals: "Finals", summers: "Summers" };

/** S4 plans. E5: sold-out plans send people to the waitlist. */
export function PlansView() {
  const router = useRouter();
  const [track, setTrack] = useState<Track>("finals");
  const [chosen, setChosen] = useState<Plan["id"]>("premium");
  const { data, isPending, isError, refetch } = usePlans(track);
  const selected = data?.items.find((p) => p.id === chosen);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <PageHeader
        eyebrow="Plans"
        title="Pick how far down the runway you want cover."
        pill="Sample data"
        subtitle="Seats are limited per cohort. Prices include GST."
      />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div role="group" aria-label="Track" className="bg-cream-soft inline-flex rounded-full p-1">
          {TRACKS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={track === t}
              onClick={() => setTrack(t)}
              className={cn(
                "min-h-11 rounded-full px-5 text-sm font-semibold md:min-h-9",
                track === t ? "bg-navy-900 text-white" : "text-navy-400",
              )}
            >
              {TRACK_LABEL[t]}
            </button>
          ))}
        </div>
        {data && (
          <div className="min-w-60 flex-1">
            <p className="text-sm font-semibold">
              {data.seats.label} · {Math.max(0, data.seats.total - data.seats.taken)} of{" "}
              {data.seats.total} left
            </p>
            <ProgressBar
              className="mt-1"
              value={data.seats.taken}
              max={data.seats.total}
              label={`${data.seats.label} taken`}
            />
          </div>
        )}
      </div>

      {data?.cohortFull && (
        <div role="status" className="bg-maroon-100 text-maroon-600 rounded-card mt-4 p-4 text-sm">
          <p className="font-semibold">This cohort is full</p>
          <p>
            Join the waitlist and you keep the Season 1 price if a seat opens.{" "}
            <Link href={ROUTES.student.waitlist} className="font-semibold underline">
              Join the waitlist
            </Link>
          </p>
        </div>
      )}

      {isError ? (
        <ErrorCard onRetry={() => refetch()} />
      ) : (
        <div
          className="mt-6 grid gap-4 md:grid-cols-3"
          {...(isPending ? { role: "status", "aria-label": "Loading plans" } : {})}
        >
          {isPending && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-96" />)}
          {data?.items.map((p) => {
            const full = p.seatsTaken >= p.seatsTotal;
            return (
              <PlanCard
                key={p.id}
                {...p}
                mostChosen={p.id === "premium"}
                elite={p.id === "elite"}
                selected={!full && chosen === p.id}
                ctaLabel={full ? "Join Waitlist" : `Choose ${p.name}`}
                onSelect={() => {
                  if (full) return router.push(ROUTES.student.waitlist);
                  setChosen(p.id);
                  document
                    .getElementById("checkout")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            );
          })}
        </div>
      )}

      {data && selected && selected.seatsTaken < selected.seatsTotal && (
        <div id="checkout" className="mt-8 scroll-mt-4">
          <CheckoutPanel key={`${selected.id}-${track}`} plan={selected} track={track} />
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs">
        <ProposedBadge />
        <span className="text-navy-400">
          Prices and seat counts are sample values pending sign-off.
        </span>
      </p>
    </div>
  );
}
