"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { RunwayTimeline } from "@/components/shared/RunwayTimeline";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/lib/config/routes";
import { formatSession } from "@/lib/utils/dates";
import { useRunway, useSessions } from "../hooks/useRunway";
import { RunwayBanner } from "./RunwayBanner";
import { SessionStatusBadge } from "./SessionStatusBadge";

/** S9 sessions and runway. */
export function SessionsView() {
  const router = useRouter();
  const runway = useRunway();
  const sessions = useSessions();

  if (runway.isPending || sessions.isPending) return <PageSkeleton />;
  if (runway.isError || sessions.isError || !runway.data || !sessions.data) {
    return (
      <ErrorCard
        onRetry={() => {
          runway.refetch();
          sessions.refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Sessions & runway</h1>
      <RunwayBanner runway={runway.data} />
      <Card variant="feature">
        <RunwayTimeline
          steps={runway.data.steps.map((s) => ({
            id: s.id,
            week: s.week,
            title: s.title,
            when: s.when,
            status: s.status,
          }))}
          onPickSlot={(id) => router.push(ROUTES.student.session(id))}
        />
      </Card>

      {sessions.data.items.length === 0 ? (
        <EmptyState title="No sessions yet" body="Book your free session to get started." />
      ) : (
        <ul className="space-y-3">
          {sessions.data.items.map((s) => (
            <li key={s.id}>
              <Link
                href={ROUTES.student.session(s.id)}
                className="rounded-card border-line hover:bg-cream-soft flex min-h-16 items-center justify-between gap-3 border bg-white p-4"
              >
                <span>
                  <span className="text-navy-400 block text-xs font-semibold tracking-wider uppercase">
                    {s.week}
                  </span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="text-navy-400 block text-sm">
                    {s.startsAt ? formatSession(s.startsAt) : "Not booked yet"}
                  </span>
                </span>
                <SessionStatusBadge status={s.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
