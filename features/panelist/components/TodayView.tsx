"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { StatCard } from "@/components/shared/StatCard";
import { usePanelistToday } from "../hooks/usePanelist";
import { PanelRow } from "./PanelRow";

/** P2 today. */
export function TodayView() {
  const { data, isPending, isError, refetch } = usePanelistToday();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const { panelist, today, upcoming, awaitingScore, stats } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Today</h1>
        <p className="text-navy-400 text-sm">
          Mon 5 Oct · {panelist.specialty} · panels run 6 to 9 PM IST
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Panels this season" value={panelist.panelsThisSeason} />
        <StatCard label="Rating" value={stats.rating.toFixed(1)} />
        <StatCard
          label="To score"
          value={stats.unscored}
          tone={stats.unscored ? "maroon" : "green"}
          hint={stats.unscored ? "Feedback is due within 48 hours" : "All caught up"}
        />
      </div>

      <section aria-labelledby="today-h" className="space-y-3">
        <h2 id="today-h" className="font-display text-xl font-bold">
          Tonight
        </h2>
        {today.length === 0 ? (
          <EmptyState title="No panels tonight" body="Your next panel is in the list below." />
        ) : (
          today.map((i) => <PanelRow key={i.sessionId} item={i} />)
        )}
      </section>

      {awaitingScore.length > 0 && (
        <section aria-labelledby="score-h" className="space-y-3">
          <h2 id="score-h" className="font-display text-xl font-bold">
            Waiting for your score
          </h2>
          {awaitingScore.map((i) => (
            <PanelRow key={i.sessionId} item={i} />
          ))}
        </section>
      )}

      <section aria-labelledby="up-h" className="space-y-3">
        <h2 id="up-h" className="font-display text-xl font-bold">
          Coming up
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing booked yet" body="Ops assigns new panels as students book." />
        ) : (
          upcoming.map((i) => <PanelRow key={i.sessionId} item={i} />)
        )}
      </section>
    </div>
  );
}
