"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { SeatGauge } from "@/features/ops/roster/components/SeatGauge";
import { Skeleton } from "@/components/shared/Skeletons";
import { ProposedBadge, SampleDataBadge } from "@/components/shared/Badges";
import { ROUTES } from "@/lib/config/routes";
import { usePlans } from "../hooks/usePlans";
import { PlanCard } from "./PlanCard";

/** S4 plans. E5: sold-out plans send people to the waitlist. */
export function PlansView() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = usePlans();

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Choose your plan</h1>
        <SampleDataBadge />
      </div>
      <p className="text-navy-400 mt-1 text-sm">
        Seats are limited per cohort. Prices include GST.
      </p>

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
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {isPending && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-96" />)}
          {data?.items.map((p) => {
            const full = p.seatsTaken >= p.seatsTotal;
            return (
              <div key={p.id} className="flex flex-col gap-3">
                <PlanCard
                  name={p.name}
                  price={p.price}
                  tagline={p.tagline}
                  features={p.features}
                  mostChosen={p.mostChosen}
                  elite={p.elite}
                  ctaLabel={full ? "Join Waitlist" : `Choose ${p.name}`}
                  onSelect={() =>
                    router.push(full ? ROUTES.student.waitlist : ROUTES.student.checkout(p.id))
                  }
                />
                <SeatGauge label={`${p.name} seats`} taken={p.seatsTaken} total={p.seatsTotal} />
              </div>
            );
          })}
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
