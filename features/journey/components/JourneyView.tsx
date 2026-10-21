"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { cn } from "@/lib/utils/cn";
import { useRunway } from "@/features/runway/hooks/useRunway";
import { RunwayBanner } from "@/features/runway/components/RunwayBanner";
import { useJourney } from "../hooks/useJourney";

const label = "text-[13px] font-semibold tracking-[0.16em] uppercase";

/** S11 journey and routes (s11.png). */
export function JourneyView() {
  const journey = useJourney();
  const runway = useRunway();
  if (journey.isPending || runway.isPending) return <PageSkeleton />;
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
  const j = journey.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <PageHeader
        eyebrow="The two-year runway"
        title="From your first term to the offer letter."
        subtitle="One CV, one answer bank, one panel that has watched you improve. Nothing gets rebuilt from scratch, because nothing gets handed off."
      />
      <RunwayBanner runway={runway.data} />

      <Card variant="feature" className="md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Where you are</h2>
          <Badge tone="maroon" className="px-4 py-1.5 text-xs">
            You joined at {j.joinedAt}
          </Badge>
        </div>
        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {j.stages.map((s) => (
            <li
              key={s.id}
              aria-current={s.state === "now" ? "step" : undefined}
              className={cn(
                "rounded-card flex min-h-40 flex-col border p-4",
                s.state === "before" && "border-line text-navy-400 border-dashed",
                s.state === "now" && "border-maroon-600 border-2 bg-white",
                s.state === "after" && "bg-navy-900 border-transparent text-white",
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold tracking-[0.12em] uppercase",
                  s.state === "now" && "text-maroon-600",
                  s.state === "after" && "text-gold-300",
                )}
              >
                {s.term}
              </p>
              <p
                className={cn(
                  "font-display mt-2 text-lg leading-tight font-bold",
                  s.state === "before" && "text-navy-900",
                )}
              >
                {s.title}
              </p>
              <p className="mt-2 text-sm">{s.detail}</p>
              {s.progress !== null && (
                <ProgressBar
                  className="mt-auto"
                  value={s.progress}
                  label="Progress through final placements"
                />
              )}
            </li>
          ))}
        </ol>
        <p className="text-navy-400 mt-4 text-sm">
          Dashed stages happened before you joined. Students who start in Term 1 get all seven on
          one record.
        </p>
      </Card>

      <section aria-labelledby="routes" className="space-y-4">
        <h2 id="routes" className="font-display text-2xl font-bold">
          Four routes to an offer
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {j.routes.map((r) => (
            <li key={r.id} className="flex">
              <Card
                variant="feature"
                className={cn(
                  "flex w-full flex-col p-6",
                  r.fit === "primary" && "border-maroon-600 border-2",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(label, "text-maroon-600", r.fit !== "primary" && "text-navy-400")}
                  >
                    {r.label}
                  </p>
                  {r.fit === "primary" && <Badge tone="maroon">Your route</Badge>}
                </div>
                {r.badge && (
                  <Badge tone="goldSoft" className="mt-3 w-fit">
                    {r.badge}
                  </Badge>
                )}
                <h3 className="mt-3 text-xl font-bold">{r.title}</h3>
                <p className="text-navy-400 mt-2">{r.description}</p>
                {r.link ? (
                  <Link
                    href={r.link.href}
                    className="text-maroon-600 mt-auto inline-flex min-h-11 items-end pt-4 text-sm font-semibold underline"
                  >
                    {r.link.label}
                  </Link>
                ) : (
                  <p className="mt-auto pt-6 text-sm font-semibold">{r.path}</p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Card variant="feature" className="p-6 md:p-8">
        <p className="text-lg leading-relaxed md:text-xl">
          <em className="font-display text-maroon-600">Anyone can run a mock interview.</em> What
          they can&apos;t do is remember what you said in your first-term profiling call when
          you&apos;re sitting in a Day 0 panel eighteen months later. That continuity is the whole
          product.
        </p>
      </Card>
    </div>
  );
}
