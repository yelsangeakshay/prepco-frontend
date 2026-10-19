"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProposedBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { cn } from "@/lib/utils/cn";
import { useRunway } from "@/features/runway/hooks/useRunway";
import { RunwayBanner } from "@/features/runway/components/RunwayBanner";
import { useJourney } from "../hooks/useJourney";

/** S11 journey and routes. */
export function JourneyView() {
  const journey = useJourney();
  const runway = useRunway();
  if (journey.isLoading || runway.isLoading) return <PageSkeleton />;
  if (journey.isError || !journey.data || !runway.data) {
    return (
      <ErrorCard
        onRetry={() => {
          journey.refetch();
          runway.refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Journey & routes</h1>
      <RunwayBanner runway={runway.data} />

      <section aria-labelledby="season">
        <h2 id="season" className="font-display mb-3 text-xl font-bold">
          Your season
        </h2>
        <ol className="space-y-3">
          {journey.data.season.map((s) => (
            <li key={s.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  s.done ? "border-green-600 bg-green-600 text-white" : "border-line bg-white",
                )}
              >
                {s.done && <Check className="size-3.5" aria-hidden />}
              </span>
              <div>
                <p className="font-semibold">
                  {s.label}
                  <span className="sr-only">{s.done ? " (done)" : " (not done yet)"}</span>
                </p>
                <p className="text-navy-400 text-sm">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="routes">
        <div className="mb-3 flex items-center gap-2">
          <h2 id="routes" className="font-display text-xl font-bold">
            Routes open to you
          </h2>
          <ProposedBadge />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {journey.data.routes.map((r) => (
            <Card key={r.id} className={cn(r.fit === "primary" && "border-maroon-600 border-2")}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{r.title}</h3>
                {r.fit === "primary" && <Badge tone="maroon">Primary</Badge>}
              </div>
              <p className="text-navy-400 mt-2 text-sm">{r.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
