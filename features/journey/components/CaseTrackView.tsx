"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { EliteBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { useCaseTrack } from "../hooks/useJourney";

/** S12 case track. Locked view for anyone not on Elite. */
export function CaseTrackView() {
  const { data, isLoading, isError, error, refetch } = useCaseTrack();
  if (isLoading) return <PageSkeleton />;

  if (error instanceof ApiError && error.code === "elite_only") {
    return (
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <Card variant="feature" data-testid="case-locked" className="text-center">
          <Lock className="text-gold-500 mx-auto size-10" aria-hidden />
          <div className="mt-3 flex items-center justify-center gap-2">
            <h1 className="font-display text-3xl font-bold">Case track</h1>
            <EliteBadge />
          </div>
          <p className="text-navy-400 mt-2 text-sm">
            Live case practice with a panelist and structured case modules. Part of the Elite plan.
          </p>
          <Button asChild className="mt-5">
            <Link href={ROUTES.student.billingUpgrade}>Upgrade To Elite</Link>
          </Button>
        </Card>
      </div>
    );
  }
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Case track</h1>
        <EliteBadge />
      </div>
      <ul className="space-y-3" data-testid="case-modules">
        {data.modules.map((m) => (
          <li key={m.id}>
            <Card className="flex items-center justify-between gap-3">
              <p className="font-semibold">{m.title}</p>
              <p className="text-navy-400 text-sm">{m.minutes} min</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
